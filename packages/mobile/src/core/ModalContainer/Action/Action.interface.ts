import { Action, AccountEvent } from 'tonapi-sdk-js';

export interface ActionProps {
  event: AccountEvent;
  action: Action;
}
