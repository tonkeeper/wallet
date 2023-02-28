import {
  ConnectEventError as IConnectEventError,
  CONNECT_EVENT_ERROR_CODES,
} from '@tonconnect/protocol';
import { TCEventID } from './EventID';

export class ConnectEventError implements IConnectEventError {
  event: IConnectEventError['event'];
  payload: IConnectEventError['payload'];
  id: IConnectEventError['id'];

  constructor(code = CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR, message: string) {
    this.event = 'connect_error';
    this.payload = {
      code,
      message,
    };
    this.id = TCEventID.getId();
  }
}
