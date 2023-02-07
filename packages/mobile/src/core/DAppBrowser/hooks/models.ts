import {
  AppRequest,
  ConnectEvent,
  ConnectRequest,
  DeviceInfo,
  RpcMethod,
  WalletResponse,
} from '@tonconnect/protocol';

export interface TonConnectInjectedBridge {
  deviceInfo: DeviceInfo;
  protocolVersion: number;
  isWalletBrowser: boolean;
  connect(
    protocolVersion: number,
    message: ConnectRequest,
    auto: boolean,
  ): Promise<ConnectEvent>;
  restoreConnection(): Promise<ConnectEvent>;
  disconnect(): Promise<void>;
  send<T extends RpcMethod>(message: AppRequest<T>): Promise<WalletResponse<T>>;
}
