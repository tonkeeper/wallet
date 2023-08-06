import { AccountAddress } from '@tonkeeper/core/src/TonAPI';
import { ActionsData } from './AccountEventsMapper.types';
import { Address } from '@tonkeeper/core';

export type SenderAddress = {
  short: string;
  friendly: string;
}

export function findSenderAccount(isReceive: boolean, data: ActionsData['data']) {
  if (data && ('sender' in data || 'recipient' in data)) {
    const senderAccount = isReceive ? data.sender : data.recipient;
    if (senderAccount) {
      return {
        address: getSenderAddress(senderAccount),
        picture: getSenderPicture(senderAccount),
      };
    }
  }

  return {
    address: {
      friendly: '',
      short: '',
    },
    picture: null,
  };
}

export function getSenderPicture(senderAccount: AccountAddress) {
  if (senderAccount.icon) {
    return senderAccount.icon;
  }

  return null;
}

export function getSenderAddress(senderAccount: AccountAddress): SenderAddress {
  if (senderAccount.name) {
    return {
      short: senderAccount.name,
      friendly: senderAccount.name,
    };
  }

  const friendly = Address(senderAccount.address).toFriendly();
  return {
    short: Address(friendly).toShort(),
    friendly,
  };
}

export function detectReceive(walletAddress: string, data: ActionsData['data']) {
  if (data && 'recipient' in data) {
    return Address.compare(data.recipient?.address, walletAddress);
  }

  return false;
}
