import { AuthRequestBody, TonLoginClient } from '@tonapps/tonlogin-client';
import { ConnectItemReply } from '@tonconnect/protocol';
import { ConnectReplyBuilder, DAppManifest } from '$tonconnect';

export interface TonConnectModalResponse {
  address: string;
  replyItems: ConnectItemReply[];
  notificationsEnabled: boolean;
  walletIdentifier: string;
}

export type TonConnectModalProps =
  | {
      protocolVersion: 1;
      tonconnect: TonLoginClient;
      request: AuthRequestBody;
      hostname: string;
      openUrl?: (url: string) => void;
    }
  | {
      protocolVersion: 2;
      manifest: DAppManifest;
      replyBuilder: ConnectReplyBuilder;
      requestPromise: {
        resolve: (response: TonConnectModalResponse) => void;
        reject: () => void;
      };
      isInternalBrowser: boolean;
    };
