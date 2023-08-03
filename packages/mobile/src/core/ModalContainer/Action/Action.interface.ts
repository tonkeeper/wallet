import { Action, AccountEvent } from '@tonkeeper/core';

export interface ActionProps {
  event: AccountEvent;
  action: Action;
  handleDecryptComment: () => void;
}
