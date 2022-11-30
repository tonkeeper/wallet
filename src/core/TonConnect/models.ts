import { AuthRequestBody, TonLoginClient } from '@tonapps/tonlogin-client';
import { ConnectItemReply, ConnectRequest } from '@tonconnect/protocol';
import { ConnectReplyBuilder } from '$tonconnect';

export interface TonConnectModalResponse {
  address: string;
  replyItems: ConnectItemReply[];
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
      connectRequest: ConnectRequest;
      replyBuilder: ConnectReplyBuilder;
      requestPromise: {
        resolve: (response: TonConnectModalResponse) => void;
        reject: () => void;
      };
      hideImmediately: boolean;
    };
