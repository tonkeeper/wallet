import { TonTransferActionContent } from './content/TonTransferActionContent';
import { ActionModalContent } from './ActionModalContent';

import { JettonTransferActionContent } from './content/JettonTransferActionContent';
import { NftItemTransferActionContent } from './content/NftItemTransferActionContent';
import { NftPurchaseActionContent } from './content/NftPurchaseActionContent';
import { JettonSwapActionContent } from './content/JettonSwapActionContent';
import { SmartContractActionContent } from './content/SmartContractActionContent';
import { AuctionBidActionContent } from './content/AuctionBidActionContent';
import { ContractDeployActionContent } from './content/ContractDeployActionContent';
import { UnSubscribeActionContent } from './content/UnSubscribeActionContent';
import { JettonMintActionContent } from './content/JettonMintActionContent';
import { JettonBurnActionContent } from './content/JettonBurnActionContent';
import { DepositStakeActionContent } from './content/DepositStakeActionContent';
import { WithdrawStakeActionContent } from './content/WithdrawStakeActionContent';
import { WithdrawStakeRequestActionContent } from './content/WithdrawStakeRequestActionContent';
import { SubscribeActionContent } from './content/SubscribeActionContent';
import {
  ActionType,
  AnyActionItem,
} from '@tonkeeper/mobile/src/wallet/models/ActivityModel';

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
    case ActionType.Subscribe:
      return <SubscribeActionContent action={action} />;
    case ActionType.UnSubscribe:
      return <UnSubscribeActionContent action={action} />;
    case ActionType.JettonMint:
      return <JettonMintActionContent action={action} />;
    case ActionType.JettonBurn:
      return <JettonBurnActionContent action={action} />;
    case ActionType.DepositStake:
      return <DepositStakeActionContent action={action} />;
    case ActionType.WithdrawStake:
      return <WithdrawStakeActionContent action={action} />;
    case ActionType.WithdrawStakeRequest:
      return <WithdrawStakeRequestActionContent action={action} />;
    default:
      return <ActionModalContent action={action} isSimplePreview />;
  }
}
