import { EventKey } from '$store/events/interface';
import { Action } from 'tonapi-sdk-js';

export interface ActionItemProps {
  eventKey: EventKey;
  borderStart?: boolean;
  borderEnd?: boolean;
  action: Action;
}