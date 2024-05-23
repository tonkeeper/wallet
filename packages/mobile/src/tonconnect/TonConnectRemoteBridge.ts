import {
  IConnectedAppConnection,
  IConnectedAppConnectionRemote,
  Toast,
  TonConnectBridgeType,
} from '$store';
import {
  AppRequest,
  Base64,
  ConnectEvent,
  ConnectRequest,
  DisconnectEvent,
  hexToByteArray,
  RpcMethod,
  SEND_TRANSACTION_ERROR_CODES,
  SessionCrypto,
  WalletResponse,
} from '@tonconnect/protocol';
import debounce from 'lodash/debounce';
import { TonConnect } from './TonConnect';
import { IConnectQrQuery, ReturnStrategy } from './models';
import EventSource, { EventSourceListener, MessageEvent } from 'react-native-sse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeeplinkOrigin } from '$libs/deeplinking';
import Minimizer from 'react-native-minimizer';
import { Linking } from 'react-native';
import { TCEventID } from './EventID';
import { AppStackRouteNames } from '$navigation';
import { getCurrentRoute, goBack } from '$navigation/imperative';
import { delay } from '$utils';
import { WithWalletIdentifier } from '$wallet/WalletTypes';

class TonConnectRemoteBridgeService {
  private readonly storeKey = 'ton-connect-http-bridge-lastEventId';

  private readonly bridgeUrl = 'https://bridge.tonapi.io/bridge';

  private readonly defaultTtl = 300;

  private eventSource: EventSource | null = null;

  private connections: WithWalletIdentifier<IConnectedAppConnectionRemote>[] = [];

  private activeRequests: { [from: string]: AppRequest<RpcMethod> } = {};

  private origin: DeeplinkOrigin | null = null;

  private returnStrategy: ReturnStrategy = 'back';

  public setOrigin(origin: DeeplinkOrigin) {
    this.origin = origin;
  }

  public setReturnStrategy(returnStrategy: ReturnStrategy) {
    if (returnStrategy) {
      this.returnStrategy = returnStrategy;
    }
  }

  async open(connections: WithWalletIdentifier<IConnectedAppConnection>[]) {
    this.close();

    this.connections = connections.filter(
      (item) => item.type === TonConnectBridgeType.Remote,
    ) as WithWalletIdentifier<IConnectedAppConnectionRemote>[];

    if (this.connections.length === 0) {
      return;
    }

    const walletSessionIds = this.connections
      .map((item) => new SessionCrypto(item.sessionKeyPair).sessionId)
      .join(',');

    let url = `${this.bridgeUrl}/events?client_id=${walletSessionIds}`;

    const lastEventId = await this.getLastEventId();

    if (lastEventId) {
      url += `&last_event_id=${lastEventId}`;
    }

    console.log('sse connect', url);

    this.eventSource = new EventSource(url);

    this.eventSource.addEventListener(
      'message',
      debounce(this.handleMessage.bind(this), 200) as EventSourceListener,
    );

    this.eventSource.addEventListener('open', () => {
      console.log('sse connect: opened');
    });

    this.eventSource.addEventListener('error', (event) => {
      console.log('sse connect: error', event);
    });
  }

  close() {
    if (this.eventSource) {
      this.eventSource.removeAllEventListeners();
      this.eventSource.close();

      this.eventSource = null;

      console.log('sse close');
    }
  }

  private async setLastEventId(lastEventId: string) {
    try {
      await AsyncStorage.setItem(this.storeKey, lastEventId);
    } catch {}
  }

  private async getLastEventId() {
    try {
      return await AsyncStorage.getItem(this.storeKey);
    } catch {
      return null;
    }
  }

  private async send<T extends RpcMethod>(
    response: WalletResponse<T> | ConnectEvent | DisconnectEvent,
    sessionCrypto: SessionCrypto,
    clientSessionId: string,
    ttl?: number,
  ): Promise<void> {
    try {
      const url = `${this.bridgeUrl}/message?client_id=${
        sessionCrypto.sessionId
      }&to=${clientSessionId}&ttl=${ttl || this.defaultTtl}`;

      const encodedResponse = sessionCrypto.encrypt(
        JSON.stringify(response),
        hexToByteArray(clientSessionId),
      );

      await fetch(url, {
        body: Base64.encode(encodedResponse),
        method: 'POST',
      });
    } catch (e) {
      console.log('send fail', e);
    }
  }

  private async handleMessage(event: MessageEvent) {
    try {
      if (event.lastEventId) {
        this.setLastEventId(event.lastEventId);
      }

      const { from, message } = JSON.parse(event.data!);

      console.log('handleMessage', from);

      const connection = this.connections.find((item) => item.clientSessionId === from);

      if (!connection) {
        console.log(`connection with clientId "${from}" not found!`);
        return;
      }

      const sessionCrypto = new SessionCrypto(connection.sessionKeyPair);

      const request: AppRequest<RpcMethod> = JSON.parse(
        sessionCrypto.decrypt(
          Base64.decode(message).toUint8Array(),
          hexToByteArray(from),
        ),
      );

      if (this.activeRequests[from]) {
        await this.send(
          {
            error: {
              code: SEND_TRANSACTION_ERROR_CODES.USER_REJECTS_ERROR,
              message: 'User has already opened the previous request',
            },
            id: request.id,
          },
          sessionCrypto,
          from,
        );

        return;
      }

      this.activeRequests[from] = request;

      console.log('handleMessage request', request);

      const response = await TonConnect.handleRequestFromRemoteBridge(
        request,
        from,
        connection.walletIdentifier,
      );

      delete this.activeRequests[from];

      console.log('handleMessage response', response);

      await this.send(response, sessionCrypto, from);

      if (request.method !== 'disconnect' && !response.error) {
        this.redirectIfNeeded();
      }
    } catch (e) {
      console.log('handleMessage error');
      console.error(e);
    }
  }

  private redirectIfNeeded() {
    console.log('returnStrategy', this.returnStrategy);
    if (this.origin === DeeplinkOrigin.DEEPLINK) {
      if (this.returnStrategy === 'back') {
        Minimizer.goBack();
      } else if (this.returnStrategy !== 'none') {
        const url = this.returnStrategy;

        Linking.openURL(url).catch((error) =>
          console.log('returnStrategy link error', error),
        );
      }
    }

    this.origin = null;
    this.returnStrategy = 'back';
  }

  async handleConnectDeeplink(query: IConnectQrQuery) {
    try {
      const protocolVersion = Number(query.v);
      const request = JSON.parse(decodeURIComponent(query.r)) as ConnectRequest;
      const clientSessionId = query.id;

      console.log('handleConnectDeeplink request', request);

      const sessionCrypto = new SessionCrypto();

      const response = await TonConnect.connect(
        protocolVersion,
        request,
        sessionCrypto,
        clientSessionId,
      );

      console.log('handleConnectDeeplink response', response);

      await this.send(response, sessionCrypto, clientSessionId);

      this.redirectIfNeeded();
    } catch (err) {
      console.log('handleConnectDeeplink error', err);

      Toast.hide();
    }
  }

  sendDisconnectEvent(connection: IConnectedAppConnectionRemote) {
    const sessionCrypto = new SessionCrypto(connection.sessionKeyPair);

    const event: DisconnectEvent = {
      id: TCEventID.getId(),
      event: 'disconnect',
      payload: {},
    };

    this.send(event, sessionCrypto, connection.clientSessionId);
  }

  async closeOtherTransactions() {
    const currentRouteName = getCurrentRoute()?.name;

    if (
      ['SheetsProvider', AppStackRouteNames.ModalContainer].includes(currentRouteName)
    ) {
      const returnStrategy = this.returnStrategy;

      this.setReturnStrategy('none');
      goBack();

      this.setReturnStrategy(returnStrategy);

      await delay(1000);
    }
  }
}

export const TonConnectRemoteBridge = new TonConnectRemoteBridgeService();
