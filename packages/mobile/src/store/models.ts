import { CryptoCurrency, FiatCurrency } from '$shared/constants';
import { AccountEvent } from '@tonkeeper/core/src/legacy';
import { TrustType } from '@tonkeeper/core/src/TonAPI';

export type TransactionType =
  | 'receive'
  | 'sent'
  | 'buy'
  | 'subscription'
  | 'unsubscription';

export interface Account {
  address: string;
  name?: string;
  icon?: string;
  isScam?: boolean;
}

export interface Jetton {
  id: string;
  name: string;
  symbol?: string;
  icon?: string;
  divisibility?: number;
}

export interface Subscription {
  id: string;
  amount: string; // nanocoins
  interval: number; // seconds
  name?: string; // optional
}

export interface FeeModel {
  account: string; // account that paid the fees
  total: string; // = gas+rent+deposit-refund
  gas: string; // nanocoins cost of gas
  rent: string; // nanocoins cost of rent
  deposit: string; // nanocoins sent with the message from the account
  refund: string; // nanocoins returned to the account as a response msg or a bounced msg
}

export interface TonTransfer {
  amount: string; // nanocoins
  recipient: Account; // address of the recipient
  sender: Account; // address of the sender
  payload?: string;
  comment?: string;
}

export interface TonDeploy {
  amount: string; // nanocoins
  recipient: Account; // address of the recipient
  sender: Account; // address of the sender
  state_init: string; // recipient’s StateInit
  payload: string;
  comment: string; // optional
}

export interface NftItemTransfer {
  sender: Account; // address of the sender
  recipient: Account; // address of the recipient
  payload: string;
  comment: string; // utf8 string from payload
}

export interface JettonTransfer {
  jetton: Jetton;
  amount: string; // base units for this jetton
  sender: Account; // address of the sender
  recipient: Account; // address of the recipient
  payload: string;
  comment: string; // utf8 string from payload
}

export interface ContractDeploy {
  address: string;
  deployer: Account; // address of the deployer
  interfaces: string[];
}

export enum ActionType {
  TonTransfer = 'tonTransfer',
  JettonTransfer = 'jettonTransfer',
  ContractDeploy = 'contractDeploy',
  NftItemTransfer = 'nftItemTransfer',
  Subscribe = 'subscribe',
  UnSubscribe = 'unSubscribe',
  Unknown = 'unknown',
  AuctionBid = 'auctionBid',
}

export type TAction = (
  | TonTransfer
  | TonDeploy
  | NftItemTransfer
  | JettonTransfer
  | ContractDeploy
) & {
  type: ActionType;
};

export type EventModel = AccountEvent;

export interface TransactionModel {
  internalId: string;
  currency: CryptoCurrency;
  shouldHide?: boolean;
  timestamp: number;
  hash: string;
  fee: string;
  type: TransactionType;
  address: string;
  confirmations: number;
  amount: string;
  isMempool?: boolean;
  isSentAll?: boolean;
  comment?: string;
  purchaseId?: string; // if buy via fiat
  lt?: number; // ton only
  provider: string;
  extra?: any;
}

export interface BuyTransactionModel {
  internalId: string;
  type: 'buy' | 'sell';
  hash: string;
  status: 'pending' | 'success' | 'failed';
  fromAmount: string;
  fromCurrency: FiatCurrency;
  amount: string;
  currency: CryptoCurrency;
  timestamp: number;
  blockchainTx: string;
  provider: string;
}

export interface SubscriptionModel {
  id?: string;
  productName: string;
  channelTgId: string;
  amountNano: string;
  intervalSec: number;
  address: string;
  status: string;
  merchantName: string;
  merchantPhoto: string;
  returnUrl: string;
  subscriptionId: number;
  subscriptionAddress: string;
  isActive?: boolean;
  chargedAt: number;
  fee: string;
  userReturnUrl: string;
}

export interface InternalNotificationModel {
  id: string;
  title: string;
  caption: string;
  mode: 'warning';
  action: {
    type: 'open_link';
    label: string;
    url?: string;
  };
  isPersistenceHide?: boolean;
}

export interface ExchangeCategoryModel {
  type?: string;
  title: string;
  subtitle: string;
  items: string[];
}

export interface MarketplaceModel {
  id: string;
  title: string;
  description: string;
  icon_url: string;
  marketplace_url: string;
}

export interface ExchangeMethodModel {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  disabled?: boolean;
  badge: string;
  badgeStyle: 'blue' | 'red';
  features: {
    text: string;
    icon: string;
  }[];
  icon_url: string;
  action_button: {
    title: string;
    url: string;
  };
  info_buttons: {
    title: string;
    url: string;
  }[];
  successUrlPattern?: {
    pattern: string;
    purchaseIdIndex: number;
  };
}

export interface CollectionModel {
  ownerAddressToDisplay?: string;
  name: string;
  description?: string;
  address: string;
}

export interface NFTModel<MetaData = {}> {
  dns?: string;
  trust: TrustType;
  verified?: boolean;
  currency: CryptoCurrency;
  internalId: string;
  provider: string;
  address: string;
  ownerAddress: string;
  index: number;
  name: string;
  description?: string;
  marketplaceURL?: string;
  collection?: CollectionModel;
  content: {
    image: {
      baseUrl: string;
    };
  };
  attributes: {
    trait_type: string;
    value: string;
  }[];
  metadata: MetaData;
  ownerAddressToDisplay?: string;
}

export interface TonDiamondMetadata {
  animation_url: string;
  image: string;
  image_diamond: string;
  lottie: string;
  theme: {
    main: string;
  };
}

export interface ProgrammableButtonsMetadata {
  buttons: {
    label?: string;
    url?: string;
    style?: string;
  }[];
}

export interface JettonMetadata {
  address: string;
  decimals: number;
  symbol?: string;
  image_data?: string;
  image?: string;
  description?: string;
  name?: string;
}

export enum JettonVerification {
  WHITELIST = 'whitelist',
  NONE = 'none',
  BLACKLIST = 'blacklist',
}

export interface JettonBalanceModel {
  currency: CryptoCurrency;
  metadata: JettonMetadata;
  balance: string;
  lock?: { amount: string; till: number };
  jettonAddress: string;
  walletAddress: string;
  verification: JettonVerification;
}

export interface FavoriteModel {
  name: string;
  address: string;
  domain?: string;
}

export enum Events {
  SendSuccess = 'send_success',
  SendOpen = 'send_open',
}

export enum SendAnalyticsFrom {
  WalletScreen = 'WalletScreen',
  TonScreen = 'TonScreen',
  TokenScreen = 'TokenScreen',
  SignRaw = 'SignRaw',
}
