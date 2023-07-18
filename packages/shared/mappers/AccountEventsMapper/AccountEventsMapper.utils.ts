import { ActionsData } from './AccountEventsMapper.types';
import { Address } from '@tonkeeper/core';

export function getSenderAccount(isReceive: boolean, data: ActionsData['data']) {
  if (data && ('sender' in data || 'recipient' in data)) {
    const senderAccount = isReceive ? data.sender : data.recipient;
    if (senderAccount) {
      if (senderAccount.name) {
        return senderAccount.name;
      }

      return Address(senderAccount.address).maskify();
    }
  }

  return '';
}

export function detectReceive(walletAddress: string, data: ActionsData['data']) {
  if (data && 'recipient' in data) {
    return Address.compare(data.recipient?.address, walletAddress);
  }

  return false;
}
