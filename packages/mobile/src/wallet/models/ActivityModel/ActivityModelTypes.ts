import {
  AccountEvent,
  TonTransferAction,
  JettonTransferAction,
  NftItemTransferAction,
  ContractDeployAction,
  SubscriptionAction,
  UnSubscriptionAction,
  AuctionBidAction,
  NftPurchaseAction,
  SmartContractAction,
  JettonSwapAction,
  JettonBurnAction,
  JettonMintAction,
  DepositStakeAction,
  WithdrawStakeAction,
  WithdrawStakeRequestAction,
  ElectionsRecoverStakeAction,
  ElectionsDepositStakeAction,
  ActionStatusEnum,
  ActionSimplePreview,
} from '@tonkeeper/core/src/TonAPI';
import {
  SendTRC20Action,
  ReceiveTRC20Action,
} from '@tonkeeper/core/src/TronAPI/TronAPIGenerated';

export type GroupKey = string;
export type ActionId = string;

export type ActionDestination = 'in' | 'out' | 'unknown';

export type ActionEvent = Omit<AccountEvent, 'actions'>;

export enum ActionAmountType {
  Jetton = 'Jetton',
  Tron = 'Tron',
  Ton = 'Ton',
}

export type ActionTonAmount = {
  type: ActionAmountType.Ton;
  value: string;
  decimals: number;
  symbol: string;
};

export type ActionTronAmount = {
  type: ActionAmountType.Tron;
  value: string;
  decimals: number;
  symbol: string;
};

export type ActionJettonAmount = {
  type: ActionAmountType.Jetton;
  jettonAddress: string;
  value: string;
  decimals?: number;
  symbol: string;
};

export type ActionAmount = ActionTonAmount | ActionJettonAmount | ActionTronAmount;

export enum ActionSource {
  Tron = 'Tron',
  Ton = 'Ton',
}

export enum ActionType {
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
  SendTRC20 = 'SendTRC20',
  ReceiveTRC20 = 'ReceiveTRC20',
  JettonBurn = 'JettonBurn',
  JettonMint = 'JettonMint',
  WithdrawStake = 'WithdrawStake',
  WithdrawStakeRequest = 'WithdrawStakeRequest',
  ElectionsRecoverStake = 'ElectionsRecoverStake',
  ElectionsDepositStake = 'ElectionsDepositStake',
  Unknown = 'Unknown',
}

export type ActionPayload = {
  [ActionType.TonTransfer]: TonTransferAction;
  [ActionType.JettonTransfer]: JettonTransferAction;
  [ActionType.NftItemTransfer]: NftItemTransferAction;
  [ActionType.ContractDeploy]: ContractDeployAction;
  [ActionType.Subscribe]: SubscriptionAction;
  [ActionType.UnSubscribe]: UnSubscriptionAction;
  [ActionType.AuctionBid]: AuctionBidAction;
  [ActionType.NftPurchase]: NftPurchaseAction;
  [ActionType.SmartContractExec]: SmartContractAction;
  [ActionType.SendTRC20]: SendTRC20Action;
  [ActionType.ReceiveTRC20]: ReceiveTRC20Action;
  [ActionType.JettonSwap]: JettonSwapAction;
  [ActionType.JettonBurn]: JettonBurnAction;
  [ActionType.JettonMint]: JettonMintAction;
  [ActionType.DepositStake]: DepositStakeAction;
  [ActionType.WithdrawStake]: WithdrawStakeAction;
  [ActionType.WithdrawStakeRequest]: WithdrawStakeRequestAction;
  [ActionType.ElectionsRecoverStake]: ElectionsRecoverStakeAction;
  [ActionType.ElectionsDepositStake]: ElectionsDepositStakeAction;
  [ActionType.Unknown]: undefined;
};

export type AnyActionPayload = ActionPayload[keyof ActionPayload];

export type ActionTypePayload<T extends ActionType = ActionType> = {
  type: T;
  payload: ActionPayload[T];
};

export type AnyActionTypePayload<T extends ActionType = ActionType> = T extends T
  ? ActionTypePayload<T>
  : never;

export interface ActionItem<T extends ActionType = ActionType> {
  type: T;
  payload: ActionPayload[T];
  action_id: string;
  isFirst?: boolean;
  isLast?: boolean;
  event: ActionEvent;
  source: ActionSource;
  initialActionType: ActionType;
  amount?: ActionAmount | null;
  status: ActionStatusEnum;
  destination: ActionDestination;
  simple_preview: ActionSimplePreview;
}

export type AnyActionItem<T extends ActionType = ActionType> = T extends T
  ? ActionItem<T>
  : never;

export type ActivitySection = {
  timestamp: number;
  data: ActionItem[];
};

export type ActivitySectionsByGroups = {
  [key in GroupKey]: ActivitySection;
};

export function isJettonTransferAction(
  action: ActionItem,
): action is ActionItem<ActionType.JettonTransfer> {
  return action.type === ActionType.JettonTransfer;
}
