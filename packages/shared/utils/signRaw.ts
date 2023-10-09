import { t } from '../i18n';
import { ActionItem, ActionType } from '@tonkeeper/core';
import { formatter } from '../formatter';

export function getActionTitle(action: ActionItem) {
  switch (action.type) {
    case ActionType.TonTransfer:
    case ActionType.JettonTransfer:
    case ActionType.NftItemTransfer:
    case ActionType.NftPurchase:
    case ActionType.JettonMint:
      if (action.destination === 'in') {
        return t('confirmSendModal.transaction_type.receive');
      } else if (action.destination === 'out') {
        return t('confirmSendModal.transaction_type.send');
      } else {
        return action.simple_preview.name;
      }
    case ActionType.JettonBurn:
      return t('confirmSendModal.transaction_type.burn');
    // for other action types we don't need custom title in sign-raw
    default:
      return undefined;
  }
}

export function formatValue(action: ActionItem) {
  if (action.amount) {
    return formatter.formatNano(action.amount.value, {
      decimals: action.amount.decimals,
      postfix: action.amount.symbol,
    });
  }
}
