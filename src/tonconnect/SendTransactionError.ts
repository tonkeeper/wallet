import {
  SendTransactionRpcResponseError,
  SEND_TRANSACTION_ERROR_CODES,
} from '@tonconnect/protocol';

export class SendTransactionError implements SendTransactionRpcResponseError {
  id: SendTransactionRpcResponseError['id'];
  error: SendTransactionRpcResponseError['error'];

  constructor(
    requestId: string,
    code: SEND_TRANSACTION_ERROR_CODES,
    message: string,
    data?: any,
  ) {
    this.id = requestId;
    this.error = {
      code,
      message,
      data,
    };
  }
}
