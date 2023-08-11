import {
  AccountEvent,
  AuctionBidAction,
  ContractDeployAction,
  DepositStakeAction,
  JettonSwapAction,
  JettonTransferAction,
  NftItemTransferAction,
  NftPurchaseAction,
  RecoverStakeAction,
  SmartContractAction,
  SubscriptionAction,
  TonTransferAction,
  UnSubscriptionAction,
} from './TonAPIGenerated';

export type TransactionDestination = 'out' | 'in' | 'unknown';

export enum CustomActionType {
  TonTransfer = 'TonTransfer',
  JettonTransfer = 'JettonTransfer',
  NftItemTransfer = 'NftItemTransfer',
  ContractDeploy = 'ContractDeploy',
  Subscribe = 'Subscribe',
  UnSubscribe = 'UnSubscribe',
  AuctionBid = 'AuctionBid',
  NftPurchase = 'NftPurchase',
  DepositStake = 'DepositStake',
  RecoverStake = 'RecoverStake',
  JettonSwap = 'JettonSwap',
  SmartContractExec = 'SmartContractExec',
  Unknown = 'Unknown',
}

export type TonTransferActionData = TonTransferAction & {
  type: CustomActionType.TonTransfer;
};

export type JettonTransferActionData = JettonTransferAction & {
  type: CustomActionType.JettonTransfer;
};

export type NftItemTransferActionData = NftItemTransferAction & {
  type: CustomActionType.NftItemTransfer;
};

export type ContractDeployActionData = ContractDeployAction & {
  type: CustomActionType.ContractDeploy;
};

export type SubscribeActionData = SubscriptionAction & {
  type: CustomActionType.Subscribe;
};

export type UnSubscribeActionData = UnSubscriptionAction & {
  type: CustomActionType.UnSubscribe;
};

export type AuctionBidActionData = AuctionBidAction & {
  type: CustomActionType.AuctionBid;
};

export type NftPurchaseActionData = NftPurchaseAction & {
  type: CustomActionType.NftPurchase;
};

export type SmartContractExecActionData = SmartContractAction & {
  type: CustomActionType.SmartContractExec;
};

export type UnknownActionData = {
  type: CustomActionType.Unknown;
};

export type DepositStakeActionData = DepositStakeAction & {
  type: CustomActionType.DepositStake;
};

export type RecoverStakeActionData = RecoverStakeAction & {
  type: CustomActionType.RecoverStake;
};

export type STONfiSwapActionData = JettonSwapAction & {
  type: CustomActionType.JettonSwap;
};

export type CustomAccountEventActions =
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

export type EventWithoutActions = Omit<AccountEvent, 'actions'>;

export type AccountEventDestination = 'in' | 'out' | 'unknown';

export type CustomAccountEvent = EventWithoutActions & {
  destination: AccountEventDestination;
};
