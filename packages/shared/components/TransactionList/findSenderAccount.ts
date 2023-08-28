import { AnyTransactionAction } from '@tonkeeper/core';

export function findSenderAccount(action: AnyTransactionAction) {
  if (action && ('sender' in action || 'recipient' in action)) {
    const senderAccount = action.destination ? action.sender : action.recipient;
    if (senderAccount) {
      return senderAccount;
    }
  }

  return null;
}
