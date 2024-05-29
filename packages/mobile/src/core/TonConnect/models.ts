import { ConnectItemReply } from '@tonconnect/protocol';
import { ConnectReplyBuilder, DAppManifest } from '$tonconnect';

export interface TonConnectModalResponse {
  address: string;
  replyItems: ConnectItemReply[];
  notificationsEnabled: boolean;
  walletIdentifier: string;
}

export interface TonConnectModalProps {
  protocolVersion: 2;
  manifest: DAppManifest;
  replyBuilder: ConnectReplyBuilder;
  requestPromise: {
    resolve: (response: TonConnectModalResponse) => void;
    reject: () => void;
  };
  isInternalBrowser: boolean;
}
