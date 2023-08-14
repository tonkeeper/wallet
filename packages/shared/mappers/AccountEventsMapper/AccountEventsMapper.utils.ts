import { AccountAddress } from '@tonkeeper/core/src/TonAPI';
import { ActionsData } from './AccountEventsMapper.types';
import { Address } from '@tonkeeper/shared/Address';

export type SenderAddress = {
  /** Sender address in short format. Might be a domain, if specified */
  short: string;
  /** Sender address in friendly format. Might be a domain, if specified */
  friendly: string;
  /** Raw sender address */
  raw: string;
};

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
      raw: '',
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
      raw: Address.parse(senderAccount.address).toRaw(),
    };
  }

  const friendly = Address.parse(senderAccount.address).toFriendly();
  return {
    short: Address.parse(friendly).toShort(),
    friendly,
    raw: Address.parse(senderAccount.address).toRaw(),
  };
}

export function detectReceive(walletAddress: string, data: ActionsData['data']) {
  if (data && 'recipient' in data) {
    return Address.compare(data.recipient?.address, walletAddress);
  }

  return false;
}
