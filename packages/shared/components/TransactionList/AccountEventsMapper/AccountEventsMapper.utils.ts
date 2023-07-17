import { formatDate } from '@tonkeeper/shared/utils/date';
import { ActionsData } from './AccountEventsMapper.types';
import { differenceInCalendarMonths } from 'date-fns';
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

export function getGroupDate(timestamp: number) {
  const ts = timestamp * 1000;
  const now = new Date();

  if (differenceInCalendarMonths(now, new Date(ts)) < 1) {
    return formatDate(new Date(ts), 'd MMMM');
  }

  return formatDate(new Date(ts), 'LLLL');
}
