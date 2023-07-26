import { IconNames } from '@tonkeeper/uikit';
import {
  Action,
  ActionTypeEnum,
  AuctionBidAction,
  ContractDeployAction,
  DepositStakeAction,
  JettonSwapAction,
  JettonTransferAction,
  NftItem,
  NftItemTransferAction,
  NftPurchaseAction,
  RecoverStakeAction,
  SmartContractAction,
  SubscriptionAction,
  TonTransferAction,
  UnSubscriptionAction,
} from '@tonkeeper/core/src/TonAPI';

export type TonTransferActionData = {
  type: ActionTypeEnum.TonTransfer;
  data: TonTransferAction;
};

export type JettonTransferActionData = {
  type: ActionTypeEnum.JettonTransfer;
  data: JettonTransferAction;
};

export type NftItemTransferActionData = {
  type: ActionTypeEnum.NftItemTransfer;
  data: NftItemTransferAction;
};

export type ContractDeployActionData = {
  type: ActionTypeEnum.ContractDeploy;
  data: ContractDeployAction;
};

export type SubscribeActionData = {
  type: ActionTypeEnum.Subscribe;
  data: SubscriptionAction;
};

export type UnSubscribeActionData = {
  type: ActionTypeEnum.UnSubscribe;
  data: UnSubscriptionAction;
};

export type AuctionBidActionData = {
  type: ActionTypeEnum.AuctionBid;
  data: AuctionBidAction;
};

export type NftPurchaseActionData = {
  type: ActionTypeEnum.NftPurchase;
  data: NftPurchaseAction;
};

export type SmartContractExecActionData = {
  type: ActionTypeEnum.SmartContractExec;
  data: SmartContractAction;
};

export type UnknownActionData = {
  type: ActionTypeEnum.Unknown;
  data: undefined;
};

export type DepositStakeActionData = {
  type: ActionTypeEnum.DepositStake;
  data: DepositStakeAction;
};

export type RecoverStakeActionData = {
  type: ActionTypeEnum.RecoverStake;
  data: RecoverStakeAction;
};

export type STONfiSwapActionData = {
  type: ActionTypeEnum.JettonSwap;
  data: JettonSwapAction;
};

export type ActionsData =
  | TonTransferActionData
  | JettonTransferActionData
  | NftItemTransferActionData
  | ContractDeployActionData
  | SubscribeActionData
  | UnSubscribeActionData
  | AuctionBidActionData
  | NftPurchaseActionData
  | UnknownActionData
  | SmartContractExecActionData
  | DepositStakeActionData
  | RecoverStakeActionData
  | STONfiSwapActionData;

export type ActionsWithData = Omit<Action, 'type'> & ActionsData;

//
//
//

export type WalletAddress = {
  friendly: string;
  raw: string;
  version: string;
};

export enum MappedEventItemType {
  Action = 'Action',
  Date = 'Date',
}

export type MappedEventDate = {
  type: MappedEventItemType.Date;
  id: string;
  date: string;
};

export type MappedEventAction = {
  type: MappedEventItemType.Action;
  id: string;
  inProgress?: boolean;
  bottomCorner?: boolean;
  topCorner?: boolean;
  iconName: IconNames;
  operation: string;
  amount?: string;
  amount2?: string;
  senderAccount?: string;
  time?: string;
  isReceive?: boolean;
  timestamp: number;
  nftAddress?: string;
  nftItem?: NftItem;
  comment?: string;
  isScam?: boolean;
  picture?: string | null;
  isFailed?: boolean;
};

export type GroupedActionsByDate = { [date: string]: MappedEventAction[] };

export type MappedEvent = MappedEventDate | MappedEventAction;

export type MappedEventActions = MappedEvent[];
