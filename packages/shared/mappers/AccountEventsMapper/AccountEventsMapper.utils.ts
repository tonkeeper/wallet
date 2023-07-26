import { AccountAddress } from '@tonkeeper/core/src/TonAPI';
import { ActionsData } from './AccountEventsMapper.types';
import { Address } from '@tonkeeper/core';

export function findSenderAccount(isReceive: boolean, data: ActionsData['data']) {
  if (data && ('sender' in data || 'recipient' in data)) {
    const senderAccount = isReceive ? data.sender : data.recipient;
    if (senderAccount) {
      return {
        address: getSenderAddress(senderAccount),
        picture: getSenderPicture(senderAccount!),
      };
    }
  }

  return {
    address: '',
    picture: null,
  };
}

export function getSenderPicture(senderAccount: AccountAddress) {
  if (senderAccount.icon) {
    return senderAccount.icon;
  }

  return null;
}

export function getSenderAddress(senderAccount: AccountAddress) {
  if (senderAccount.name) {
    return senderAccount.name;
  }

  return Address(senderAccount.address).maskify();
}

export function detectReceive(walletAddress: string, data: ActionsData['data']) {
  if (data && 'recipient' in data) {
    return Address.compare(data.recipient?.address, walletAddress);
  }

  return false;
}
