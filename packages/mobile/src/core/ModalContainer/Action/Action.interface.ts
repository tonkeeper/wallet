import { Action, AccountEvent } from '@tonkeeper/core/src/legacy';

export interface ActionProps {
  event: AccountEvent;
  action: Action;
  handleDecryptComment: () => void;
}
