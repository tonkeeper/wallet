import { AccountAddress, AccountEvent, Action, EncryptedComment } from '@tonkeeper/core';

export interface ActionItemProps {
  event: AccountEvent;
  borderStart?: boolean;
  borderEnd?: boolean;
  action: Action;
  decryptComment: (
    actionKey: string,
    encryptedComment?: EncryptedComment,
    sender?: AccountAddress,
  ) => Promise<void>;
}
