import { EventKey } from '$store/events/interface';
import { Action } from 'tonapi-sdk-js';

export interface ActionProps {
  eventKey: EventKey;
  action: Action;
}
