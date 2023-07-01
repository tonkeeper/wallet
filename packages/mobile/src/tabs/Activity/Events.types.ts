export type ServerEvents = ServerAccountEvent[];

export type ServerAccountEvent = {
  event_id: string;
  account: Account;
  timestamp: number;
  actions: EventAction[];
  fee: Fee;
  is_scam: boolean;
  lt: number;
  in_progress: boolean;
  extra: number;
};

export type Account = {
  address: string;
  is_scam: boolean;
  name?: string;
};

export enum EventActionType {
  TonTransfer = 'TonTransfer',
  JettonTransfer = 'JettonTransfer',
  NftItemTransfer = 'NftItemTransfer',
  ContractDeploy = 'ContractDeploy',
  Subscribe = 'Subscribe',
  UnSubscribe = 'UnSubscribe',
  AuctionBid = 'AuctionBid',
  NftPurchase = 'NftPurchase',
  SmartContractExec = 'SmartContractExec',
  Unknown = 'Unknown',
}

export type EventAction = {
  type: EventActionType;
  status: string;
  simple_preview: SimplePreview;

  TonTransfer?: TonTransfer; //
  JettonTransfer?: JettonTransfer; //
  NftItemTransfer?: NftItemTransferAction;
  ContractDeploy?: ContractDeployAction;
  Subscribe?: SubscriptionAction;
  UnSubscribe?: UnSubscriptionAction;
  AuctionBid?: AuctionBidAction;
  NftPurchase?: any;//NftPurchaseAction;
  SmartContractExec?: SmartContractExec; //
  Unknown?: any;//UnknownAction;
};

//
// Mapped
//

export type TonTransferActionData = {
  type: EventActionType.TonTransfer;
  data: TonTransfer;
};

export type JettonTransferActionData = {
  type: EventActionType.JettonTransfer;
  data: JettonTransfer;
};

export type NftItemTransferActionData = {
  type: EventActionType.NftItemTransfer;
  data: NftItemTransferAction;
};

export type ContractDeployActionData = {
  type: EventActionType.ContractDeploy;
  data: ContractDeployAction;
};

export type SubscribeActionData = {
  type: EventActionType.Subscribe;
  data: SubscriptionAction;
};

export type UnSubscribeActionData = {
  type: EventActionType.UnSubscribe;
  data: UnSubscriptionAction;
};

export type AuctionBidActionData = {
  type: EventActionType.AuctionBid;
  data: AuctionBidAction;
};

export type NftPurchaseActionData = {
  type: EventActionType.NftPurchase;
  data: any;
};

export type SmartContractExecActionData = {
  type: EventActionType.SmartContractExec;
  data: SmartContractExec;
};

export type UnknownActionData = {
  type: EventActionType.Unknown;
};

type BaseEventAction = {
  simple_preview: SimplePreview;
  status: string;
};

type EventActions = 
  | TonTransferActionData
  | JettonTransferActionData
  | NftItemTransferActionData
  | ContractDeployActionData
  | SubscribeActionData
  | UnSubscribeActionData
  | AuctionBidActionData
  | NftPurchaseActionData
  | UnknownActionData;

export type MergedEventAction = BaseEventAction & EventActions;

export interface Price {
  value: string;
  tokenName: string;
}

export interface AuctionBidAction {
  auctionType: AuctionBidActionAuctionType;
  amount: Price;
  nft?: any; // TODO:
  beneficiary: Account;
  bidder: Account;
}

export enum AuctionBidActionAuctionType {
  DnsTon = 'DNS.ton',
  DnsTg = 'DNS.tg',
  NumberTg = 'NUMBER.tg',
  Getgems = 'getgems',
}

export interface ContractDeployAction {
  address: string;
  interfaces: Array<string>;
}

export enum RefundTypeEnum {
  DnsTon = 'DNS.ton',
  DnsTg = 'DNS.tg',
  GetGems = 'GetGems',
}

export interface Refund {
  type: RefundTypeEnum;
  origin: string;
}

export interface NftItemTransferAction {
  sender?: Account;
  recipient?: Account;
  nft: string;
  comment?: string;
  payload?: string;
  refund?: Refund;
}

export interface SubscriptionAction {
  subscriber: Account;
  subscription: string;
  beneficiary: Account;
  amount: number;
  initial: boolean;
}

export interface UnSubscriptionAction {
  subscriber: Account;
  subscription: string;
  beneficiary: Account;
}

export type TonTransfer = {
  sender: Account;
  recipient: Account;
  amount: number;
};

export type JettonTransfer = {
  sender: Account;
  recipient: Account;
  senders_wallet: string;
  recipients_wallet: string;
  amount: string;
  jetton: Jetton;
  comment?: string;
};

export type Jetton = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  image: string;
  verification: string;
};

export type SimplePreview = {
  name: string;
  description: string;
  value?: string;
  accounts: Account[];
  value_image?: string;
};

export type SmartContractExec = {
  executor: Account;
  contract: Account;
  ton_attached: number;
  operation: string;
  payload?: string;
};

export type Fee = {
  account: Account;
  total: number;
  gas: number;
  rent: number;
  deposit: number;
  refund: number;
};
