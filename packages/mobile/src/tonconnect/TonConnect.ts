import { openSignRawModal } from '$core/ModalContainer/NFTOperations/Modals/SignRawModal';
import { SignRawParams } from '$core/ModalContainer/NFTOperations/TXRequest.types';
import { TonConnectModalResponse } from '$core/TonConnect/models';
import { openTonConnect } from '$core/TonConnect/TonConnectModal';
import {
  findConnectedAppByClientSessionId,
  findConnectedAppByUrl,
  IConnectedApp,
  saveAppConnection,
  removeConnectedApp,
  store,
  TonConnectBridgeType,
  IConnectedAppConnectionRemote,
  Toast,
  IConnectedAppConnection,
  removeInjectedConnection,
  removeRemoteConnection,
  enableNotifications,
} from '$store';
import { debugLog } from '$utils/debugLog';
import { getTimeSec } from '$utils/getTimeSec';
import {
  AppRequest,
  ConnectEvent,
  ConnectRequest,
  CONNECT_EVENT_ERROR_CODES,
  RpcMethod,
  SEND_TRANSACTION_ERROR_CODES,
  SessionCrypto,
  WalletResponse,
  CHAIN,
} from '@tonconnect/protocol';
import axios from 'axios';
import FastImage from 'react-native-fast-image';
import TonWeb from 'tonweb';
import { MIN_PROTOCOL_VERSION, tonConnectDeviceInfo } from './config';
import { ConnectEventError } from './ConnectEventError';
import { ConnectReplyBuilder } from './ConnectReplyBuilder';
import { TCEventID } from './EventID';
import { DAppManifest } from './models';
import { SendTransactionError } from './SendTransactionError';
import { tk } from '$wallet';
import { TonConnectRemoteBridge } from './TonConnectRemoteBridge';
import { WithWalletIdentifier } from '$wallet/WalletTypes';
import { getDomainFromURL } from '$utils';
import { Address } from '@tonkeeper/core';
import { t } from '@tonkeeper/shared/i18n';

class TonConnectService {
  checkProtocolVersionCapability(protocolVersion: number) {
    if (typeof protocolVersion !== 'number' || protocolVersion < MIN_PROTOCOL_VERSION) {
      throw new ConnectEventError(
        CONNECT_EVENT_ERROR_CODES.BAD_REQUEST_ERROR,
        `Protocol version ${String(protocolVersion)} is not supported by the wallet app`,
      );
    }
  }

  verifyConnectRequest(request: ConnectRequest) {
    if (!(request && request.manifestUrl && request.items?.length)) {
      throw new ConnectEventError(
        CONNECT_EVENT_ERROR_CODES.BAD_REQUEST_ERROR,
        'Wrong request data',
      );
    }
  }

  async getManifest(request: ConnectRequest) {
    try {
      console.log('request.manifestUrl', request.manifestUrl);
      const { data: manifest } = await axios.get<DAppManifest>(request.manifestUrl);

      const isValid =
        manifest &&
        typeof manifest.url === 'string' &&
        typeof manifest.name === 'string' &&
        typeof manifest.iconUrl === 'string';

      if (!isValid) {
        throw new ConnectEventError(
          CONNECT_EVENT_ERROR_CODES.MANIFEST_CONTENT_ERROR,
          'Manifest is not valid',
        );
      }

      if (manifest.iconUrl) {
        FastImage.preload([{ uri: manifest.iconUrl }]);
      }

      return manifest;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ConnectEventError(
          CONNECT_EVENT_ERROR_CODES.MANIFEST_NOT_FOUND_ERROR,
          `Can't get ${request.manifestUrl}`,
        );
      }

      throw error;
    } finally {
      Toast.hide();
    }
  }

  async connect(
    protocolVersion: number,
    request: ConnectRequest,
    sessionCrypto?: SessionCrypto,
    clientSessionId?: string,
    webViewUrl?: string,
  ): Promise<ConnectEvent> {
    try {
      this.checkProtocolVersionCapability(protocolVersion);

      this.verifyConnectRequest(request);

      const manifest = await this.getManifest(request);

      if (getDomainFromURL(manifest.url) === 'tonkeeper.com') {
        throw new ConnectEventError(
          CONNECT_EVENT_ERROR_CODES.BAD_REQUEST_ERROR,
          'Bad request',
        );
      }

      try {
        const { address, replyItems, notificationsEnabled, walletIdentifier } =
          await new Promise<TonConnectModalResponse>((resolve, reject) =>
            openTonConnect({
              protocolVersion: protocolVersion as 2,
              manifest,
              replyBuilder: new ConnectReplyBuilder(request, manifest),
              requestPromise: { resolve, reject },
              isInternalBrowser: !!webViewUrl,
            }),
          );

        const wallet = tk.wallets.get(walletIdentifier)!;

        saveAppConnection(
          wallet.isTestnet,
          address,
          {
            name: manifest.name,
            url: manifest.url,
            icon: manifest.iconUrl,
            notificationsEnabled,
          },
          webViewUrl
            ? { type: TonConnectBridgeType.Injected, replyItems }
            : {
                type: TonConnectBridgeType.Remote,
                sessionKeyPair: sessionCrypto!.stringifyKeypair(),
                clientSessionId: clientSessionId!,
                replyItems,
              },
        );

        if (notificationsEnabled) {
          enableNotifications(wallet.isTestnet, address, manifest.url, clientSessionId);
        }

        return {
          id: TCEventID.getId(),
          event: 'connect',
          payload: {
            items: replyItems,
            device: tonConnectDeviceInfo,
          },
        };
      } catch {
        throw new ConnectEventError(
          CONNECT_EVENT_ERROR_CODES.USER_REJECTS_ERROR,
          'Wallet declined the request',
        );
      }
    } catch (error) {
      if (error instanceof ConnectEventError) {
        return error;
      }

      error && debugLog(error.message);

      return new ConnectEventError(
        CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR,
        error?.message,
      );
    }
  }

  /**
   * Only for injected ton-connect bridge
   */
  async autoConnect(webViewUrl: string): Promise<ConnectEvent> {
    try {
      const connectedApp = findConnectedAppByUrl(webViewUrl);

      if (
        !connectedApp ||
        connectedApp.connections.length === 0 ||
        connectedApp.autoConnectDisabled
      ) {
        throw new ConnectEventError(
          CONNECT_EVENT_ERROR_CODES.UNKNOWN_APP_ERROR,
          'Unknown app',
        );
      }

      const state = store.getState();
      const currentWalletAddress = state.wallet?.address?.ton;

      let walletStateInit = '';
      let publicKey = new Uint8Array();
      try {
        if (state.wallet?.wallet?.vault?.tonPublicKey) {
          publicKey = state.wallet.wallet.vault.tonPublicKey;
        }
        if (state.wallet?.wallet) {
          const tonWallet = state.wallet.wallet.vault.tonWallet;
          const { stateInit } = await tonWallet.createStateInit();
          walletStateInit = TonWeb.utils.bytesToBase64(await stateInit.toBoc(false));
        }
      } catch (err) {
        debugLog(err);
      }

      const replyItems = ConnectReplyBuilder.createAutoConnectReplyItems(
        currentWalletAddress,
        publicKey,
        walletStateInit,
      );

      if (
        !connectedApp.connections.some(
          (item) => item.type === TonConnectBridgeType.Injected,
        )
      ) {
        saveAppConnection(
          tk.wallet.isTestnet,
          currentWalletAddress,
          {
            name: connectedApp.name,
            url: connectedApp.url,
            icon: connectedApp.icon,
            notificationsEnabled: connectedApp.notificationsEnabled,
          },
          { type: TonConnectBridgeType.Injected, replyItems },
        );
      }

      return {
        id: TCEventID.getId(),
        event: 'connect',
        payload: {
          items: replyItems,
          device: tonConnectDeviceInfo,
        },
      };
    } catch (error) {
      if (error instanceof ConnectEventError) {
        return error;
      }

      error && debugLog(error.message);

      return new ConnectEventError(
        CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR,
        error?.message,
      );
    }
  }

  async handleDisconnectRequest(
    request: AppRequest<'disconnect'>,
    connectedApp: IConnectedApp,
    connection: WithWalletIdentifier<IConnectedAppConnection>,
  ): Promise<WalletResponse<'disconnect'>> {
    if (connection.type === TonConnectBridgeType.Injected) {
      removeInjectedConnection(connectedApp.url);
    } else {
      removeRemoteConnection(
        tk.wallets.get(connection.walletIdentifier)!.isTestnet,
        connectedApp,
        connection,
      );
    }

    return {
      id: request.id,
      result: {},
    };
  }

  async sendTransaction(
    request: AppRequest<'sendTransaction'>,
    connection: WithWalletIdentifier<IConnectedAppConnection>,
  ): Promise<WalletResponse<'sendTransaction'>> {
    try {
      const wallet = tk.wallets.get(connection.walletIdentifier)!;

      const params = JSON.parse(request.params[0]);

      const isValidRequest =
        params &&
        typeof params.valid_until === 'number' &&
        Array.isArray(params.messages) &&
        params.messages.every((msg) => !!msg.address && !!msg.amount);

      const walletNetwork = wallet.isTestnet ? CHAIN.TESTNET : CHAIN.MAINNET;

      const isValidNetwork = params.network ? params.network === walletNetwork : true;

      const isValidFrom = params.from
        ? Address.compare(params.from, wallet.address.ton.raw)
        : true;

      if (!isValidRequest) {
        Toast.fail(t('tonconnect_error.bad_request'));

        throw new SendTransactionError(
          request.id,
          SEND_TRANSACTION_ERROR_CODES.BAD_REQUEST_ERROR,
          'Bad request',
        );
      }

      if (!isValidNetwork) {
        Toast.fail(t('tonconnect_error.wrong_network'));

        throw new SendTransactionError(
          request.id,
          SEND_TRANSACTION_ERROR_CODES.BAD_REQUEST_ERROR,
          'Wrong network',
        );
      }

      if (!isValidFrom) {
        Toast.fail(t('tonconnect_error.wrong_from'));

        throw new SendTransactionError(
          request.id,
          SEND_TRANSACTION_ERROR_CODES.BAD_REQUEST_ERROR,
          'Wrong "from" parameter',
        );
      }

      const { valid_until, messages } = params;

      if (valid_until && valid_until < getTimeSec()) {
        throw new SendTransactionError(
          request.id,
          SEND_TRANSACTION_ERROR_CODES.BAD_REQUEST_ERROR,
          'Request timed out',
        );
      }

      const txParams: SignRawParams = {
        valid_until,
        messages,
        source: wallet.address.ton.raw,
      };

      const boc = await new Promise<string>(async (resolve, reject) => {
        const openModalResult = await openSignRawModal(
          txParams,
          {
            expires_sec: valid_until,
            response_options: {
              broadcast: false,
            },
          },
          resolve,
          () =>
            reject(
              new SendTransactionError(
                request.id,
                SEND_TRANSACTION_ERROR_CODES.USER_REJECTS_ERROR,
                'Wallet declined the request',
              ),
            ),
          true,
          connection.type === TonConnectBridgeType.Remote &&
            connection.walletIdentifier === tk.wallet.identifier,
          connection.walletIdentifier,
        );

        if (!openModalResult) {
          reject(
            new SendTransactionError(
              request.id,
              SEND_TRANSACTION_ERROR_CODES.UNKNOWN_ERROR,
              'Open transaction modal failed',
            ),
          );
        }
      });

      return {
        result: boc,
        id: request.id,
      };
    } catch (error) {
      if (error instanceof SendTransactionError) {
        return error;
      }

      error && debugLog(error.message);

      return new SendTransactionError(
        request.id,
        SEND_TRANSACTION_ERROR_CODES.UNKNOWN_ERROR,
        error?.message,
      );
    }
  }

  private async handleRequest<T extends RpcMethod>(
    request: AppRequest<T>,
    connectedApp: IConnectedApp | null,
    connection: WithWalletIdentifier<IConnectedAppConnection> | null,
  ): Promise<WalletResponse<T>> {
    if (!connectedApp || !connection) {
      return {
        error: {
          code: SEND_TRANSACTION_ERROR_CODES.UNKNOWN_APP_ERROR,
          message: 'Unknown app',
        },
        id: request.id,
      };
    }

    if (request.method === 'disconnect') {
      return this.handleDisconnectRequest(request, connectedApp, connection);
    }

    if (request.method === 'sendTransaction') {
      return this.sendTransaction(request, connection);
    }

    return {
      error: {
        code: SEND_TRANSACTION_ERROR_CODES.BAD_REQUEST_ERROR,
        message: `Method "${request.method}" does not supported by the wallet app`,
      },
      id: request.id,
    };
  }

  async handleRequestFromInjectedBridge<T extends RpcMethod>(
    request: AppRequest<T>,
    webViewUrl: string,
  ): Promise<WalletResponse<T>> {
    const connectedApp = findConnectedAppByUrl(webViewUrl);

    const allConnections = connectedApp?.connections ?? [];

    const connection =
      allConnections.find((item) => item.type === TonConnectBridgeType.Injected) || null;

    return this.handleRequest(
      request,
      connectedApp,
      connection ? { ...connection, walletIdentifier: tk.wallet.identifier } : null,
    );
  }

  async handleRequestFromRemoteBridge<T extends RpcMethod>(
    request: AppRequest<T>,
    clientSessionId: string,
    walletIdentifier: string,
  ): Promise<WalletResponse<T>> {
    const { connectedApp, connection } = findConnectedAppByClientSessionId(
      clientSessionId,
      walletIdentifier,
    );

    return this.handleRequest(
      request,
      connectedApp,
      connection ? { ...connection, walletIdentifier } : null,
    );
  }

  async disconnect(url: string) {
    const connectedApp = findConnectedAppByUrl(url);

    if (!connectedApp) {
      return;
    }

    const remoteConnections = connectedApp.connections.filter(
      (connection) => connection.type === TonConnectBridgeType.Remote,
    ) as IConnectedAppConnectionRemote[];

    remoteConnections.forEach((connection) =>
      TonConnectRemoteBridge.sendDisconnectEvent(connection),
    );

    removeConnectedApp(url);
  }
}

export const TonConnect = new TonConnectService();
