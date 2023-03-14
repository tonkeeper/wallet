import { AccountEvent, Action } from 'tonapi-sdk-js';

export interface ActionItemProps {
  event: AccountEvent;
  borderStart?: boolean;
  borderEnd?: boolean;
  action: Action;
}
