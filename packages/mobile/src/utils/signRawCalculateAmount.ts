import BigNumber from 'bignumber.js';

import { SignRawMessage } from '$core/ModalContainer/NFTOperations/TXRequest.types';

export const calculateMessageTransferAmount = (messages: SignRawMessage[]) => {
  if (!messages) {
    return 0;
  }
  return messages.reduce(
    (acc, message) => new BigNumber(acc).plus(new BigNumber(message.amount)).toString(),
    '0',
  );
};
