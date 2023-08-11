import {
  AccountEvent,
  ActionSimplePreview,
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

type MakeCustomAction<TType, TAction> = TAction & {
  type: TType;
  isFailed: boolean;
  simple_preview: ActionSimplePreview;
};

export type CustomTonTransferAction = MakeCustomAction<
  CustomActionType.TonTransfer,
  TonTransferAction
>;

export type CustomJettonTransferAction = MakeCustomAction<
  CustomActionType.JettonTransfer,
  JettonTransferAction
>;

export type CustomNftItemTransferAction = MakeCustomAction<
  CustomActionType.NftItemTransfer,
  NftItemTransferAction
>;

export type CustomContractDeployAction = MakeCustomAction<
  CustomActionType.ContractDeploy,
  ContractDeployAction & {
    walletInitialized: boolean;
  }
>;

export type CustomSubscribeAction = MakeCustomAction<
  CustomActionType.Subscribe,
  SubscriptionAction
>;

export type CustomUnSubscribeAction = MakeCustomAction<
  CustomActionType.UnSubscribe,
  UnSubscriptionAction
>;

export type CustomAuctionBidAction = MakeCustomAction<
  CustomActionType.AuctionBid,
  AuctionBidAction
>;

export type CustomNftPurchaseAction = MakeCustomAction<
  CustomActionType.NftPurchase,
  NftPurchaseAction
>;

export type CustomSmartContractExecAction = MakeCustomAction<
  CustomActionType.SmartContractExec,
  SmartContractAction
>;

export type CustomDepositStakeAction = MakeCustomAction<
  CustomActionType.DepositStake,
  DepositStakeAction
>;

export type CustomRecoverStakeAction = MakeCustomAction<
  CustomActionType.RecoverStake,
  RecoverStakeAction
>;

export type CustomJettonSwapAction = MakeCustomAction<
  CustomActionType.JettonSwap,
  JettonSwapAction
>;

export type CustomUnknownAction = MakeCustomAction<CustomActionType.Unknown, {}>;

export type CustomAccountEventActions =
  | CustomTonTransferAction
  | CustomJettonTransferAction
  | CustomNftItemTransferAction
  | CustomContractDeployAction
  | CustomSubscribeAction
  | CustomUnSubscribeAction
  | CustomAuctionBidAction
  | CustomNftPurchaseAction
  | CustomUnknownAction
  | CustomSmartContractExecAction
  | CustomDepositStakeAction
  | CustomRecoverStakeAction
  | CustomJettonSwapAction;

export type EventWithoutActions = Omit<AccountEvent, 'actions'>;

export type AccountEventDestination = 'in' | 'out' | 'unknown';

export type CustomAccountEvent = EventWithoutActions & {
  destination: AccountEventDestination;
};
