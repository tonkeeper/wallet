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

export enum ActivityActionType {
  TonTransfer = 'TonTransfer',
  JettonTransfer = 'JettonTransfer',
  NftItemTransfer = 'NftItemTransfer',
  ContractDeploy = 'ContractDeploy',
  Subscribe = 'Subscribe',
  UnSubscribe = 'UnSubscribe',
  AuctionBid = 'AuctionBid',
  NftPurchase = 'NftPurchase',
  DepositStake = 'DepositStake',
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

type MakeActivityAction<TActionType, TActionData> = TActionData & {
  destination: ActionDestination;
  simple_preview: ActionSimplePreview;
  amount?: ActivityActionAmount | null;
  status: ActionStatusEnum;
  isFailed: boolean;
  type: TActionType;
};

export type TonTransferActionData = MakeActivityAction<
  ActivityActionType.TonTransfer,
  TonTransferAction
>;

export type JettonTransferActionData = MakeActivityAction<
  ActivityActionType.JettonTransfer,
  JettonTransferAction
>;

export type NftItemTransferActionData = MakeActivityAction<
  ActivityActionType.NftItemTransfer,
  NftItemTransferAction
>;

export type ContractDeployActionData = MakeActivityAction<
  ActivityActionType.ContractDeploy,
  ContractDeployAction
>;

export type SubscribeActionData = MakeActivityAction<
  ActivityActionType.Subscribe,
  SubscriptionAction
>;

export type UnSubscribeActionData = MakeActivityAction<
  ActivityActionType.UnSubscribe,
  UnSubscriptionAction
>;

export type AuctionBidActionData = MakeActivityAction<
  ActivityActionType.AuctionBid,
  AuctionBidAction
>;

export type NftPurchaseActionData = MakeActivityAction<
  ActivityActionType.NftPurchase,
  NftPurchaseAction
>;

export type SmartContractExecActionData = MakeActivityAction<
  ActivityActionType.SmartContractExec,
  SmartContractAction
>;

export type DepositStakeActionData = MakeActivityAction<
  ActivityActionType.DepositStake,
  DepositStakeAction
>;

export type JettonSwapActionData = MakeActivityAction<
  ActivityActionType.JettonSwap,
  JettonSwapAction
>;

export type SendTRC20ActionData = MakeActivityAction<
  ActivityActionType.SendTRC20,
  SendTRC20Action
>;

export type ReceiveTRC20ActionData = MakeActivityAction<
  ActivityActionType.ReceiveTRC20,
  ReceiveTRC20Action
>;

export type JettonBurnActionData = MakeActivityAction<
  ActivityActionType.JettonBurn,
  JettonBurnAction
>;

export type JettonMintActionData = MakeActivityAction<
  ActivityActionType.JettonMint,
  JettonMintAction
>;

export type WithdrawStakeActionData = MakeActivityAction<
  ActivityActionType.WithdrawStake,
  WithdrawStakeAction
>;

export type WithdrawStakeRequestActionData = MakeActivityAction<
  ActivityActionType.WithdrawStakeRequest,
  WithdrawStakeRequestAction
>;

export type ElectionsRecoverStakeData = MakeActivityAction<
  ActivityActionType.ElectionsRecoverStake,
  ElectionsRecoverStakeAction
>;

export type ElectionsDepositStakeActionData = MakeActivityAction<
  ActivityActionType.ElectionsDepositStake,
  ElectionsDepositStakeAction
>;

export type UnknownActionData = MakeActivityAction<ActivityActionType.Unknown, {}>;

export type AnyActivityAction =
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

export enum ActivitySource {
  Tron = 'Tron',
  Ton = 'Ton',
}

export type ActivityEvent = Omit<AccountEvent, 'actions'>;

export type ActivityActionAmount = {
  value: number | string;
  decimals?: number;
  symbol: string;
};

export type ActivityItem = {
  action: AnyActivityAction;
  event: ActivityEvent;
  source: ActivitySource;
  isFirst?: boolean; // is first in event
  isLast?: boolean; // is last in event
  id: string; // {eventId}_{index}
};

export type GroupKey = string;

export type ActionId = string;

export type ActivitySection = {
  timestamp: number;
  data: ActivityItem[];
};

export type ActivitySections = ActivitySection[];

export type ActivitysByGroups = {
  [key in GroupKey]: ActivitySection;
};

export type ActivityItems = ActivityItem[];
