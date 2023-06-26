export type Events = AccountEvent[];

export type AccountEvent = {
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

export enum ActionType {
  TonTransfer = 'TonTransfer',
  JettonTransfer = 'JettonTransfer',
  NftItemTransfer = 'NftItemTransfer',
  ContractDeploy = 'ContractDeploy',
  Subscribe = 'Subscribe',
  UnSubscribe = 'UnSubscribe',
  AuctionBid = 'AuctionBid',
  NftPurchase = 'NftPurchase',
  SmartContractExec = 'SmartContractExec',
  Unknown = 'Unknown'
};

export type EventAction = {
  type: ActionType;
  status: string;
  simple_preview: SimplePreview;

  TonTransfer?: TonTransfer;
  JettonTransfer?: JettonTransfer;
  SmartContractExec?: SmartContractExec;
};

export type TonTransfer = {
  sender: Account;
  recipient: Account;
  amount: number;
};

export type SimplePreview = {
  name: string;
  description: string;
  value?: string;
  accounts: Account[];
  value_image?: string;
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


