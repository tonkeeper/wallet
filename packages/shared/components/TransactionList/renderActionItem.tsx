import {
  CustomAccountEventActions,
  CustomAccountEvent,
  CustomActionType,
} from '@tonkeeper/core/src/TonAPI';
import { SmartContractExecItem } from './items/SmartContractExecItem';
import { JettonTransferItem } from './items/JettonTransferItem';
import { ContractDeployItem } from './items/ContractDeployItem';
import { SimplePreviewItem } from './items/SimplePreviewItem';
import { NftTransferItem } from './items/NftTransferItem';
import { NftPurchaseItem } from './items/NftPurchaseItem';
import { UnSubscribeItem } from './items/UnSubscribeItem';
import { TonTransferItem } from './items/TonTransferItem';
import { JettonSwapItem } from './items/JettonSwapItem';
import { AuctionBidItem } from './items/AuctionBidItem';
import { SubscribeItem } from './items/SubscribeItem';
import { UnknownItem } from './items/UnknownItem';

export function renderActionItem(
  action: CustomAccountEventActions,
  event: CustomAccountEvent,
) {
  switch (action.type) {
    case CustomActionType.TonTransfer:
      return <TonTransferItem event={event} action={action} />;
    case CustomActionType.JettonTransfer:
      return <JettonTransferItem event={event} action={action} />;
    case CustomActionType.NftItemTransfer:
      return <NftTransferItem event={event} action={action} />;
    case CustomActionType.NftPurchase:
      return <NftPurchaseItem event={event} action={action} />;
    case CustomActionType.JettonSwap:
      return <JettonSwapItem event={event} action={action} />;
    case CustomActionType.AuctionBid:
      return <AuctionBidItem event={event} action={action} />;
    case CustomActionType.ContractDeploy:
      return <ContractDeployItem event={event} action={action} />;
    case CustomActionType.Subscribe:
      return <SubscribeItem event={event} action={action} />;
    case CustomActionType.UnSubscribe:
      return <UnSubscribeItem event={event} action={action} />;
    case CustomActionType.SmartContractExec:
      return <SmartContractExecItem event={event} action={action} />;
    case CustomActionType.Unknown:
      return <UnknownItem event={event} />;
    default:
      return <SimplePreviewItem action={action} event={event} />;
  }
}

// function getItemLayout(data, index) {
//   const size = { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index };

//   if (data.type === 'Date') {
//     return;
//   }

//   switch (data.type) {
//   }
// }