import { AccountAddress, AccountEvent, Action, EncryptedComment } from '@tonkeeper/core/src/legacy';

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
