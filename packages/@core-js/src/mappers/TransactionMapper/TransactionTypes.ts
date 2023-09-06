import { ReceiveTRC20Action, SendTRC20Action } from '../../TronAPI/TronAPIGenerated';
import {
  AccountEvent,
  ActionSimplePreview,
  ActionStatusEnum,
  AuctionBidAction,
  ContractDeployAction,
  DepositStakeAction,
  ElectionsDepositStakeAction,
  ElectionsRecoverStakeAction,
  JettonBurnAction,
  JettonMintAction,
  JettonSwapAction,
  JettonTransferAction,
  NftItemTransferAction,
  NftPurchaseAction,
  SmartContractAction,
  SubscriptionAction,
  TonTransferAction,
  UnSubscriptionAction,
  WithdrawStakeAction,
  WithdrawStakeRequestAction,
} from '../../TonAPI/TonAPIGenerated';

export enum TransactionActionType {
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
  SendTRC20 = 'SendTRC20',
  ReceiveTRC20 = 'ReceiveTRC20',
  JettonBurn = 'JettonBurn',
  JettonMint = 'JettonMint',
  WithdrawStake = 'WithdrawStake',
  WithdrawStakeRequest = 'WithdrawStakeRequest',
  ElectionsRecoverStake = 'ElectionsRecoverStake',
  ElectionsDepositStake = 'ElectionsDepositStake',
}

export type ActionDestination = 'in' | 'out' | 'unknown';

type MakeTransactionAction<TActionType, TActionData> = TActionData & {
  destination: ActionDestination;
  simple_preview: ActionSimplePreview;
  amount?: TransactionActionAmount | null;
  status: ActionStatusEnum;
  isFailed: boolean;
  type: TActionType;
};

export type TonTransferActionData = MakeTransactionAction<
  TransactionActionType.TonTransfer,
  TonTransferAction
>;

export type JettonTransferActionData = MakeTransactionAction<
  TransactionActionType.JettonTransfer,
  JettonTransferAction
>;

export type NftItemTransferActionData = MakeTransactionAction<
  TransactionActionType.NftItemTransfer,
  NftItemTransferAction
>;

export type ContractDeployActionData = MakeTransactionAction<
  TransactionActionType.ContractDeploy,
  ContractDeployAction
>;

export type SubscribeActionData = MakeTransactionAction<
  TransactionActionType.Subscribe,
  SubscriptionAction
>;

export type UnSubscribeActionData = MakeTransactionAction<
  TransactionActionType.UnSubscribe,
  UnSubscriptionAction
>;

export type AuctionBidActionData = MakeTransactionAction<
  TransactionActionType.AuctionBid,
  AuctionBidAction
>;

export type NftPurchaseActionData = MakeTransactionAction<
  TransactionActionType.NftPurchase,
  NftPurchaseAction
>;

export type SmartContractExecActionData = MakeTransactionAction<
  TransactionActionType.SmartContractExec,
  SmartContractAction
>;

export type DepositStakeActionData = MakeTransactionAction<
  TransactionActionType.DepositStake,
  DepositStakeAction
>;

export type JettonSwapActionData = MakeTransactionAction<
  TransactionActionType.JettonSwap,
  JettonSwapAction
>;

export type SendTRC20ActionData = MakeTransactionAction<
  TransactionActionType.SendTRC20,
  SendTRC20Action
>;

export type ReceiveTRC20ActionData = MakeTransactionAction<
  TransactionActionType.ReceiveTRC20,
  ReceiveTRC20Action
>;

export type JettonBurnActionData = MakeTransactionAction<
  TransactionActionType.JettonBurn,
  JettonBurnAction
>;

export type JettonMintActionData = MakeTransactionAction<
  TransactionActionType.JettonMint,
  JettonMintAction
>;

export type WithdrawStakeActionData = MakeTransactionAction<
  TransactionActionType.WithdrawStake,
  WithdrawStakeAction
>;

export type WithdrawStakeRequestActionData = MakeTransactionAction<
  TransactionActionType.WithdrawStakeRequest,
  WithdrawStakeRequestAction
>;

export type ElectionsRecoverStakeData = MakeTransactionAction<
  TransactionActionType.ElectionsRecoverStake,
  ElectionsRecoverStakeAction
>;

export type ElectionsDepositStakeActionData = MakeTransactionAction<
  TransactionActionType.ElectionsDepositStake,
  ElectionsDepositStakeAction
>;

export type UnknownActionData = MakeTransactionAction<TransactionActionType.Unknown, {}>;

export type AnyTransactionAction =
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
  | JettonSwapActionData
  | SendTRC20ActionData
  | ReceiveTRC20ActionData
  | JettonBurnActionData
  | JettonMintActionData
  | WithdrawStakeActionData
  | WithdrawStakeRequestActionData
  | ElectionsRecoverStakeData
  | ElectionsDepositStakeActionData;

export enum TransactionEventSource {
  Tron = 'Tron',
  Ton = 'Ton',
}

export type AccountEventWithMaybeSource = AccountEvent & {
  source?: TransactionEventSource;
};

export type TransactionEvent = Omit<AccountEvent, 'actions'> & {
  source: TransactionEventSource;
};

export enum TransactionItemType {
  Section = 'Section',
  Action = 'Action',
}

export type TransactionActionAmount = {
  value: number | string;
  decimals?: number;
  symbol: string;
};

export type TransactionItemAction = {
  type: TransactionItemType.Action;
  action: AnyTransactionAction;
  event: TransactionEvent;
  isFirst?: boolean;
  isLast?: boolean;
  id: string;
};

export type TransactionItemSection = {
  type: TransactionItemType.Section;
  timestamp: number;
  id: string;
};

export type TransactionItem = TransactionItemSection | TransactionItemAction;

export type TransactionItems = TransactionItem[];
