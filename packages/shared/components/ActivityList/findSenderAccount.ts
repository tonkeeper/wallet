import { AnyActionItem } from '@tonkeeper/mobile/src/wallet/models/ActivityModel';

export function findSenderAccount(action: AnyActionItem) {
  if (action.payload && ('sender' in action.payload || 'recipient' in action.payload)) {
    const senderAccount =
      action.destination === 'in' ? action.payload?.sender : action.payload?.recipient;
    if (senderAccount) {
      return senderAccount;
    }
  }

  return null;
}
