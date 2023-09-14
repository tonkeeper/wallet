import { ActionType, AnyActionItem } from '@tonkeeper/core';

import { TonTransferActionContent } from './content/TonTransferActionContent';
import { ActionModalContent } from './ActionModalContent';
import { ExtraListItem } from './components/ExtraListItem';

export function renderActionModalContent(action: AnyActionItem) {
  switch (action.type) {
    case ActionType.TonTransfer:
      return <TonTransferActionContent action={action} />;
    case ActionType.JettonTransfer:
    case ActionType.NftItemTransfer:
    case ActionType.NftPurchase:
    case ActionType.SmartContractExec:
    case ActionType.AuctionBid:
    case ActionType.ContractDeploy:
    case ActionType.ReceiveTRC20:
    case ActionType.SendTRC20:
    case ActionType.JettonBurn:
    case ActionType.JettonMint:
    case ActionType.DepositStake:
    case ActionType.WithdrawStake:
    case ActionType.WithdrawStakeRequest:
    case ActionType.JettonSwap:
    case ActionType.Subscribe:
    case ActionType.UnSubscribe:
    default:
      return (
        <ActionModalContent action={action}>
          <ExtraListItem extra={action.event.extra} />
        </ActionModalContent>
      );
  }
}
