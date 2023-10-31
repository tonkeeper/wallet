import BigNumber from 'bignumber.js';

import { SignRawMessage } from '$core/ModalContainer/NFTOperations/TXRequest.types';
import { ActionType, Address } from '@tonkeeper/core';
import { Action } from '@tonkeeper/core/src/TonAPI';
import { ActionTypeEnum } from 'tonapi-sdk-js';

export const calculateActionsTotalAmount = (messages: SignRawMessage[]) => {
  if (!messages.length) {
    return 0;
  }
  return messages.reduce((acc, message) => {
    return new BigNumber(acc).plus(new BigNumber(message.amount)).toString();
  }, '0');
};

export const calculateMessageTransferAmount = (messages: SignRawMessage[]) => {
  if (!messages) {
    return 0;
  }
  return 0;
  return messages.reduce(
    (acc, message) => new BigNumber(acc).plus(new BigNumber(message.amount)).toString(),
    '0',
  );
};
