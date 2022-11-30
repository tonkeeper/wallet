import { openSignRawModal } from '$core/ModalContainer/NFTOperations/Modals/SignRawModal';
import { SignRawParams } from '$core/ModalContainer/NFTOperations/TXRequest.types';
import { TonConnectModalResponse } from '$core/TonConnect/models';
import { openTonConnect } from '$navigation';
import {
  findConnectedAppByClientSessionId,
  findConnectedAppByUrl,
  IConnectedApp,
  saveAppConnection,
  removeConnectedApp,
  store,
  TonConnectBridgeType,
  IConnectedAppConnectionRemote,
} from '$store';
import { debugLog } from '$utils';
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
} from '@tonconnect/protocol';
import FastImage from 'react-native-fast-image';
import {
  CURRENT_PROTOCOL_VERSION,
  MIN_PROTOCOL_VERSION,
  tonConnectDeviceInfo,
} from './config';
import { ConnectEventError } from './ConnectEventError';
import { ConnectReplyBuilder } from './ConnectReplyBuilder';
import { SendTransactionError } from './SendTransactionError';
import { TonConnectRemoteBridge } from './TonConnectRemoteBridge';

class TonConnectService {
  checkProtocolVersionCapability(protocolVersion: number) {
    if (
      typeof protocolVersion !== 'number' ||
      protocolVersion > CURRENT_PROTOCOL_VERSION ||
      protocolVersion < MIN_PROTOCOL_VERSION
    ) {
      throw new ConnectEventError(
        CONNECT_EVENT_ERROR_CODES.BAD_REQUEST_ERROR,
        `Protocol version ${String(protocolVersion)} is not supported by the wallet app`,
      );
    }
  }

  verifyConnectRequest(request: ConnectRequest) {
    if (!(request && request.name && request.url && request.items?.length)) {
      throw new ConnectEventError(
        CONNECT_EVENT_ERROR_CODES.BAD_REQUEST_ERROR,
        'Wrong request data',
      );
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

      if (request.icon) {
        FastImage.preload([{ uri: request.icon }]);
      }

      try {
        const { address, replyItems } = await new Promise<TonConnectModalResponse>(
          (resolve, reject) =>
            openTonConnect({
              protocolVersion: protocolVersion as 2,
              connectRequest: request,
              replyBuilder: new ConnectReplyBuilder(request),
              requestPromise: { resolve, reject },
              hideImmediately: !!webViewUrl,
            }),
        );

        saveAppConnection(
          address,
          {
            name: request.name,
            url: request.url,
            icon: request.icon,
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

        return {
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

      if (!connectedApp || connectedApp.connections.length === 0) {
        throw new ConnectEventError(
          CONNECT_EVENT_ERROR_CODES.UNKNOWN_APP_ERROR,
          'Unknown app',
        );
      }

      const currentWalletAddress = store.getState().wallet?.address?.ton;

      const replyBuilder = new ConnectReplyBuilder({} as ConnectRequest);

      const replyItems = replyBuilder.createAutoConnectReplyItems(currentWalletAddress);

      return {
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

  async sendTransaction(
    request: AppRequest<'sendTransaction'>,
  ): Promise<WalletResponse<'sendTransaction'>> {
    try {
      const params = JSON.parse(request.params[0]) as SignRawParams;

      const isValidRequest =
        params &&
        typeof params.valid_until === 'number' &&
        Array.isArray(params.messages) &&
        params.messages.every((msg) => !!msg.address && !!msg.amount);

      if (!isValidRequest) {
        throw new SendTransactionError(
          request.id,
          SEND_TRANSACTION_ERROR_CODES.BAD_REQUEST_ERROR,
          'Bad request',
        );
      }

      const { valid_until, messages } = params;

      if (valid_until < getTimeSec()) {
        throw new SendTransactionError(
          request.id,
          SEND_TRANSACTION_ERROR_CODES.BAD_REQUEST_ERROR,
          'Request timed out',
        );
      }

      const currentWalletAddress = store.getState().wallet?.address?.ton;

      const txParams: SignRawParams = {
        valid_until,
        messages,
        source: currentWalletAddress,
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
  ): Promise<WalletResponse<T>> {
    if (!connectedApp) {
      return {
        error: {
          code: SEND_TRANSACTION_ERROR_CODES.UNKNOWN_APP_ERROR,
          message: 'Unknown app',
        },
        id: request.id,
      };
    }

    if (request.method === 'sendTransaction') {
      return this.sendTransaction(request);
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

    return this.handleRequest(request, connectedApp);
  }

  async handleRequestFromRemoteBridge<T extends RpcMethod>(
    request: AppRequest<T>,
    clientSessionId: string,
  ): Promise<WalletResponse<T>> {
    const { connectedApp } = findConnectedAppByClientSessionId(clientSessionId);

    return this.handleRequest(request, connectedApp);
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
