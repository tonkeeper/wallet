import { TonTransferActionContent } from './content/TonTransferActionContent';
import { ActionType, AnyActionItem } from '@tonkeeper/core';
import { ActionModalContent } from './ActionModalContent';

import { JettonTransferActionContent } from './content/JettonTransferActionContent';
import { NftItemTransferActionContent } from './content/NftItemTransferActionContent';
import { NftPurchaseActionContent } from './content/NftPurchaseActionContent';
import { JettonSwapActionContent } from './content/JettonSwapActionContent';
import { SmartContractActionContent } from './content/SmartContractActionContent';
import { AuctionBidActionContent } from './content/AuctionBidActionContent';
import { ContractDeployActionContent } from './content/ContractDeployActionContent';

export function renderActionModalContent(action: AnyActionItem) {
  switch (action.type) {
    case ActionType.TonTransfer:
      return <TonTransferActionContent action={action} />;
    case ActionType.JettonTransfer:
      return <JettonTransferActionContent action={action} />;
    case ActionType.NftItemTransfer:
      return <NftItemTransferActionContent action={action} />;
    case ActionType.NftPurchase:
      return <NftPurchaseActionContent action={action} />;
    case ActionType.SmartContractExec:
      return <SmartContractActionContent action={action} />;
    case ActionType.AuctionBid:
      return <AuctionBidActionContent action={action} />;
    case ActionType.ContractDeploy:
      return <ContractDeployActionContent action={action} />;
    case ActionType.JettonSwap:
      return <JettonSwapActionContent action={action} />;
    case ActionType.JettonBurn:
    case ActionType.JettonMint:
    case ActionType.DepositStake:
    case ActionType.WithdrawStake:
    case ActionType.WithdrawStakeRequest:
    case ActionType.Subscribe:
    case ActionType.UnSubscribe:
    default:
      return <ActionModalContent action={action} />;
  }
}
