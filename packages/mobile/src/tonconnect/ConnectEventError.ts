import {
  ConnectEventError as IConnectEventError,
  CONNECT_EVENT_ERROR_CODES,
} from '@tonconnect/protocol';

export class ConnectEventError implements IConnectEventError {
  event: IConnectEventError['event'];
  payload: IConnectEventError['payload'];

  constructor(code = CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR, message: string) {
    this.event = 'connect_error';
    this.payload = {
      code,
      message,
    };
  }
}
