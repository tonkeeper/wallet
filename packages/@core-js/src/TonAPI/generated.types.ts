/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Error {
  /** @example "error description" */
  error: string;
}

export interface AccountAddress {
  /** @example "0:10C1073837B93FDAAD594284CE8B8EFF7B9CF25427440EB2FC682762E1471365" */
  address: string;
  /**
   * Display name. Data collected from different sources like moderation lists, dns, collections names and over.
   * @example "Ton foundation"
   */
  name?: string;
  /**
   * Is this account was marked as part of scammers activity
   * @example true
   */
  is_scam: boolean;
  /** @example "https://ton.org/logo.png" */
  icon?: string;
}

export interface Block {
  /**
   * @format int32
   * @example 0
   */
  workchain_id: number;
  /** @example 8000000000000000 */
  shard: string;
  /**
   * @format int32
   * @example 21734019
   */
  seqno: number;
  /** @example "131D0C65055F04E9C19D687B51BC70F952FD9CA6F02C2801D3B89964A779DF85" */
  root_hash: string;
  /** @example "A6A0BD6608672B11B79538A50B2204E748305C12AA0DED9C16CF0006CE3AF8DB" */
  file_hash: string;
  /**
   * @format int32
   * @example -239
   */
  global_id: number;
  /**
   * @format int32
   * @example 0
   */
  version: number;
  /** @example true */
  after_merge: boolean;
  /** @example true */
  before_split: boolean;
  /** @example true */
  after_split: boolean;
  /** @example true */
  want_split: boolean;
  /** @example true */
  want_merge: boolean;
  /** @example true */
  key_block: boolean;
  /**
   * @format int64
   * @example 1674826775
   */
  gen_utime: number;
  /**
   * @format int64
   * @example 23814011000000
   */
  start_lt: number;
  /**
   * @format int64
   * @example 23814011000001
   */
  end_lt: number;
  /**
   * @format int32
   * @example 0
   */
  vert_seqno: number;
  /**
   * @format int32
   * @example 0
   */
  gen_catchain_seqno: number;
  /**
   * @format int32
   * @example 0
   */
  min_ref_mc_seqno: number;
  /**
   * @format int32
   * @example 0
   */
  prev_key_block_seqno: number;
  /**
   * @format int32
   * @example 0
   */
  gen_software_version?: number;
  /**
   * @format int64
   * @example 0
   */
  gen_software_capabilities?: number;
  /** @example "(-1,4234234,8000000000000000)" */
  master_ref?: string;
  prev_refs: string[];
  /**
   * @format int64
   * @example 0
   */
  in_msg_descr_length: number;
  /**
   * @format int64
   * @example 0
   */
  out_msg_descr_length: number;
  /** @example "131D0C65055F04E9C19D687B51BC70F952FD9CA6F02C2801D3B89964A779DF85" */
  rand_seed: string;
  /** @example "A6A0BD6608672B11B79538A50B2204E748305C12AA0DED9C16CF0006CE3AF8DB" */
  created_by: string;
}

/** @example "active" */
export enum AccountStatus {
  Nonexist = 'nonexist',
  Uninit = 'uninit',
  Active = 'active',
  Frozen = 'frozen',
}

export interface StateInit {
  /** @example "te6ccgEBBgEARAABFP8A9KQT9LzyyAsBAgEgAgMCAUgEBQAE8jAAONBsIdMfMO1E0NM/MAHAAZekyMs/ye1UkzDyBuIAEaE0MdqJoaZ+YQ==" */
  boc: string;
}

export interface Message {
  /**
   * @format int64
   * @example 25713146000001
   */
  created_lt: number;
  /** @example true */
  ihr_disabled: boolean;
  /** @example true */
  bounce: boolean;
  /** @example true */
  bounced: boolean;
  /**
   * @format int64
   * @example 60000000
   */
  value: number;
  /**
   * @format int64
   * @example 5681002
   */
  fwd_fee: number;
  /**
   * @format int64
   * @example 5681002
   */
  ihr_fee: number;
  destination?: AccountAddress;
  source?: AccountAddress;
  /**
   * @format int64
   * @example 5681002
   */
  import_fee: number;
  /**
   * @format int64
   * @example 5681002
   */
  created_at: number;
  /** @example "0xdeadbeaf" */
  op_code?: string;
  init?: StateInit;
  /**
   * hex-encoded BoC with raw message body
   * @example "B5EE9C7201010101001100001D00048656C6C6F2C20776F726C64218"
   */
  raw_body?: string;
  /** @example "nft_transfer" */
  decoded_op_name?: string;
  decoded_body: any;
}

/** @example "TransOrd" */
export enum TransactionType {
  TransOrd = 'TransOrd',
  TransTickTock = 'TransTickTock',
  TransSplitPrepare = 'TransSplitPrepare',
  TransSplitInstall = 'TransSplitInstall',
  TransMergePrepare = 'TransMergePrepare',
  TransMergeInstall = 'TransMergeInstall',
  TransStorage = 'TransStorage',
}

/** @example "acst_unchanged" */
export enum AccStatusChange {
  AcstUnchanged = 'acst_unchanged',
  AcstFrozen = 'acst_frozen',
  AcstDeleted = 'acst_deleted',
}

/** @example "cskip_no_state" */
export enum ComputeSkipReason {
  CskipNoState = 'cskip_no_state',
  CskipBadState = 'cskip_bad_state',
  CskipNoGas = 'cskip_no_gas',
}

/** @example "cskip_no_state" */
export enum BouncePhaseType {
  TrPhaseBounceNegfunds = 'TrPhaseBounceNegfunds',
  TrPhaseBounceNofunds = 'TrPhaseBounceNofunds',
  TrPhaseBounceOk = 'TrPhaseBounceOk',
}

export interface ComputePhase {
  /** @example true */
  skipped: boolean;
  skip_reason?: ComputeSkipReason;
  /** @example true */
  success?: boolean;
  /**
   * @format int64
   * @example 1000
   */
  gas_fees?: number;
  /**
   * @format int64
   * @example 10000
   */
  gas_used?: number;
  /**
   * @format uint32
   * @example 5
   */
  vm_steps?: number;
  /**
   * @format int32
   * @example 0
   */
  exit_code?: number;
}

export interface StoragePhase {
  /**
   * @format int64
   * @example 25713146000001
   */
  fees_collected: number;
  /**
   * @format int64
   * @example 25713146000001
   */
  fees_due?: number;
  status_change: AccStatusChange;
}

export interface CreditPhase {
  /**
   * @format int64
   * @example 100
   */
  fees_collected: number;
  /**
   * @format int64
   * @example 1000
   */
  credit: number;
}

export interface ActionPhase {
  /** @example true */
  success: boolean;
  /**
   * @format int32
   * @example 5
   */
  total_actions: number;
  /**
   * @format int32
   * @example 5
   */
  skipped_actions: number;
  /**
   * @format int64
   * @example 1000
   */
  fwd_fees: number;
  /**
   * @format int64
   * @example 1000
   */
  total_fees: number;
}

export interface Transaction {
  /** @example "55e8809519cd3c49098c9ee45afdafcea7a894a74d0f628d94a115a50e045122" */
  hash: string;
  /**
   * @format int64
   * @example 25713146000001
   */
  lt: number;
  account: AccountAddress;
  /** @example true */
  success: boolean;
  /**
   * @format int64
   * @example 1645544908
   */
  utime: number;
  orig_status: AccountStatus;
  end_status: AccountStatus;
  /**
   * @format int64
   * @example 25713146000001
   */
  total_fees: number;
  transaction_type: TransactionType;
  /** @example "55e8809519cd3c49098c9ee45afdafcea7a894a74d0f628d94a115a50e045122" */
  state_update_old: string;
  /** @example "55e8809519cd3c49098c9ee45afdafcea7a894a74d0f628d94a115a50e045122" */
  state_update_new: string;
  in_msg?: Message;
  out_msgs: Message[];
  /** @example "(-1,4234234,8000000000000000)" */
  block: string;
  /** @example "55e8809519cd3c49098c9ee45afdafcea7a894a74d0f628d94a115a50e045122" */
  prev_trans_hash?: string;
  /**
   * @format int64
   * @example 25713146000001
   */
  prev_trans_lt?: number;
  compute_phase?: ComputePhase;
  storage_phase?: StoragePhase;
  credit_phase?: CreditPhase;
  action_phase?: ActionPhase;
  bounce_phase?: BouncePhaseType;
  /** @example true */
  aborted: boolean;
  /** @example true */
  destroyed: boolean;
}

export interface Transactions {
  transactions: Transaction[];
}

export interface ValidatorsSet {
  utime_since: number;
  utime_until: number;
  total: number;
  main: number;
  total_weight?: number;
  list: {
    public_key: string;
  }[];
}

export interface Validator {
  /** @example "0:55e8809519cd3c49098c9ee45afdafcea7a894a74d0f628d94a115a50e045122" */
  address: string;
}

export interface Validators {
  validators: Validator[];
}

export interface AccountStorageInfo {
  /**
   * @format int64
   * @example 567
   */
  used_cells: number;
  /**
   * @format int64
   * @example 567
   */
  used_bits: number;
  /**
   * @format int64
   * @example 567
   */
  used_public_cells: number;
  /**
   * @format int64
   * @example 567
   */
  last_paid: number;
  /**
   * @format int64
   * @example 567
   */
  due_payment: number;
}

export interface RawAccount {
  /** @example "0:da6b1b6663a0e4d18cc8574ccd9db5296e367dd9324706f3bbd9eb1cd2caf0bf" */
  address: string;
  /**
   * @format int64
   * @example 123456789
   */
  balance: number;
  extra_balance?: Record<string, string>;
  /** @example "b5ee9c72410104010087000114ff00f4a413f4a0f2c80b0102012002030002d200dfa5ffff76a268698fe9ffe8e42c5267858f90e785ffe4f6aa6467c444ffb365ffc10802faf0807d014035e7a064b87d804077e7857fc10803dfd2407d014035e7a064b86467cd8903a32b9ba4410803ade68afd014035e7a045ea432b6363796103bb7b9363210c678b64b87d807d8040c249b3e4" */
  code?: string;
  /** @example "b5ee9c7241010101002600004811fd096c0000000000000000000000000000000000000000000000000000000000000000cb78264d" */
  data?: string;
  /**
   * @format int64
   * @example 123456789
   */
  last_transaction_lt: number;
  /** @example "active" */
  status: string;
  storage: AccountStorageInfo;
}

export interface Account {
  /** @example "0:da6b1b6663a0e4d18cc8574ccd9db5296e367dd9324706f3bbd9eb1cd2caf0bf" */
  address: string;
  /**
   * @format int64
   * @example 123456789
   */
  balance: number;
  /**
   * unix timestamp
   * @format int64
   * @example 123456789
   */
  last_activity: number;
  /** @example "active" */
  status: string;
  interfaces?: string[];
  /** @example "Ton foundation" */
  name?: string;
  /** @example true */
  is_scam?: boolean;
  /** @example "https://ton.org/logo.png" */
  icon?: string;
  /** @example true */
  memo_required?: boolean;
  /** @example ["get_item_data"] */
  get_methods: string[];
}

export interface Accounts {
  accounts: Account[];
}

export interface MethodExecutionResult {
  /** @example true */
  success: boolean;
  /**
   * tvm exit code
   * @example 0
   */
  exit_code: number;
  stack: TvmStackRecord[];
  decoded?: any;
}

export interface TvmStackRecord {
  /** @example "cell" */
  type: 'cell' | 'num' | 'nan' | 'null' | 'tuple';
  /** @example "te6cckEBAQEAJAAAQ4ARPeUceMlv4l12d6jdLpIzzbAV6amYXNZeZK2aicQdC/Apj8aJ" */
  cell?: string;
  /** @example "" */
  slice?: string;
  /** @example "" */
  num?: string;
  /** @example [] */
  tuple?: TvmStackRecord[];
}

export interface Config {
  /** config address */
  '0': string;
  /** elector address */
  '1': string;
  /** minter address */
  '2': string;
  /** dns root address */
  '4': string;
  '32'?: ValidatorsSet;
  '33'?: ValidatorsSet;
  '34'?: ValidatorsSet;
  '35'?: ValidatorsSet;
  '36'?: ValidatorsSet;
  '37'?: ValidatorsSet;
  /**
   * config boc in base64 format
   * @example "te6ccgEBBgEARAABFP8A9KQT9LzyyAsBAgEgAgMCAUgEBQAE8jAAONBsIdMfMO1E0NM/MAHAAZekyMs/ye1UkzDyBuIAEaE0MdqJoaZ+YQ=="
   */
  raw: string;
}

export interface DomainNames {
  domains: string[];
}

export interface DomainBid {
  /**
   * @default false
   * @example true
   */
  success: boolean;
  /**
   * @format int64
   * @example 1660050553
   */
  value: number;
  /**
   * @format int64
   * @example 1660050553
   */
  txTime: number;
  /** @example "55e8809519cd3c49098c9ee45afdafcea7a894a74d0f628d94a115a50e045122" */
  txHash: string;
  bidder: AccountAddress;
}

export interface DomainBids {
  data: DomainBid[];
}

export enum JettonVerificationType {
  Whitelist = 'whitelist',
  Blacklist = 'blacklist',
  None = 'none',
}

export interface JettonPreview {
  /** @example "0:0BB5A9F69043EEBDDA5AD2E946EB953242BD8F603FE795D90698CEEC6BFC60A0" */
  address: string;
  /** @example "Wrapped TON" */
  name: string;
  /** @example "WTON" */
  symbol: string;
  /** @example 9 */
  decimals: number;
  /** @example "https://cache.tonapi.io/images/jetton.jpg" */
  image: string;
  verification: JettonVerificationType;
}

export interface JettonBalance {
  /** @example 597968399 */
  balance: string;
  wallet_address: AccountAddress;
  jetton: JettonPreview;
}

export interface JettonsBalances {
  balances: JettonBalance[];
}

export interface Price {
  /** @example 123000000000 */
  value: string;
  /** @example "TON" */
  token_name: string;
}

export interface ImagePreview {
  /** @example "100x100" */
  resolution: string;
  /** @example "https://site.com/pic1.jpg" */
  url: string;
}

export interface Sale {
  /** @example "0:10C1073837B93FDAAD594284CE8B8EFF7B9CF25427440EB2FC682762E1471365" */
  address: string;
  market: AccountAddress;
  owner?: AccountAddress;
  price: Price;
}

export interface NftItem {
  /** @example "0:E93E7D444180608B8520C00DC664383A387356FB6E16FDDF99DBE5E1415A574B" */
  address: string;
  /**
   * @format int64
   * @example 58
   */
  index: number;
  owner?: AccountAddress;
  collection?: {
    /** @example "0:E93E7D444180608B8520C00DC664383A387356FB6E16FDDF99DBE5E1415A574B" */
    address: string;
    /** @example "TON Diamonds" */
    name: string;
  };
  /** @example true */
  verified: boolean;
  /** @example {} */
  metadata: Record<string, any>;
  sale?: Sale;
  previews?: ImagePreview[];
  /** @example "crypto.ton" */
  dns?: string;
  approved_by: ('getgems' | 'tonkeeper')[];
}

export interface NftItems {
  nft_items: NftItem[];
}

export interface Refund {
  /** @example "DNS.ton" */
  type: 'DNS.ton' | 'DNS.tg' | 'GetGems';
  /** @example "0:da6b1b6663a0e4d18cc8574ccd9db5296e367dd9324706f3bbd9eb1cd2caf0bf" */
  origin: string;
}

export interface ValueFlow {
  account: AccountAddress;
  /**
   * @format int64
   * @example 80
   */
  ton: number;
  /**
   * @format int64
   * @example 10
   */
  fees: number;
  jettons?: {
    account: AccountAddress;
    /**
     * @format int64
     * @example 10
     */
    quantity: number;
  }[];
}

export interface Action {
  /** @example "TonTransfer" */
  type:
    | 'TonTransfer'
    | 'JettonTransfer'
    | 'NftItemTransfer'
    | 'ContractDeploy'
    | 'Subscribe'
    | 'UnSubscribe'
    | 'AuctionBid'
    | 'NftPurchase'
    | 'DepositStake'
    | 'RecoverStake'
    | 'STONfiSwap'
    | 'SmartContractExec'
    | 'Unknown';
  /** @example "ok" */
  status: 'ok' | 'failed' | 'pending';
  TonTransfer?: TonTransferAction;
  ContractDeploy?: ContractDeployAction;
  JettonTransfer?: JettonTransferAction;
  NftItemTransfer?: NftItemTransferAction;
  Subscribe?: SubscriptionAction;
  UnSubscribe?: UnSubscriptionAction;
  AuctionBid?: AuctionBidAction;
  NftPurchase?: NftPurchaseAction;
  DepositStake?: DepositStakeAction;
  RecoverStake?: RecoverStakeAction;
  STONfiSwap?: STONfiSwapAction;
  SmartContractExec?: SmartContractAction;
  /** shortly describes what this action is about. */
  simple_preview: ActionSimplePreview;
}

export interface TonTransferAction {
  sender: AccountAddress;
  recipient: AccountAddress;
  /**
   * amount in nanotons
   * @format int64
   * @example 123456789
   */
  amount: number;
  /**
   * @example "Hi! This is your salary.
   * From accounting with love."
   */
  comment?: string;
  refund?: Refund;
}

export interface SmartContractAction {
  executor: AccountAddress;
  contract: AccountAddress;
  /**
   * amount in nanotons
   * @format int64
   * @example 123456789
   */
  ton_attached: number;
  /** @example "NftTransfer or 0x35d95a12" */
  operation: string;
  payload?: string;
  refund?: Refund;
}

export interface NftItemTransferAction {
  sender?: AccountAddress;
  recipient?: AccountAddress;
  /** @example "" */
  nft: string;
  /**
   * @example "Hi! This is your salary.
   * From accounting with love."
   */
  comment?: string;
  /**
   * raw hex encoded payload
   * @example "0234de3e21d21b3ee21f3"
   */
  payload?: string;
  refund?: Refund;
}

export interface JettonTransferAction {
  sender?: AccountAddress;
  recipient?: AccountAddress;
  /** @example "0:E93E7D444180608B8520C00DC664383A387356FB6E16FDDF99DBE5E1415A574B" */
  senders_wallet: string;
  /** @example "0:E93E7D444180608B8520C00DC664383A387356FB6E16FDDF99DBE5E1415A574B" */
  recipients_wallet: string;
  /**
   * amount in quanta of tokens
   * @example 1000000000
   */
  amount: string;
  /**
   * @example "Hi! This is your salary.
   * From accounting with love."
   */
  comment?: string;
  refund?: Refund;
  jetton: JettonPreview;
}

export interface ContractDeployAction {
  /** @example "0:da6b1b6663a0e4d18cc8574ccd9db5296e367dd9324706f3bbd9eb1cd2caf0bf" */
  address: string;
  /** @example ["nft_item","nft_royalty"] */
  interfaces: string[];
}

export interface SubscriptionAction {
  subscriber: AccountAddress;
  /** @example "0:da6b1b6663a0e4d18cc8574ccd9db5296e367dd9324706f3bbd9eb1cd2caf0bf" */
  subscription: string;
  beneficiary: AccountAddress;
  /**
   * @format int64
   * @example 1000000000
   */
  amount: number;
  /** @example false */
  initial: boolean;
}

export interface UnSubscriptionAction {
  subscriber: AccountAddress;
  /** @example "0:da6b1b6663a0e4d18cc8574ccd9db5296e367dd9324706f3bbd9eb1cd2caf0bf" */
  subscription: string;
  beneficiary: AccountAddress;
}

export interface AuctionBidAction {
  auction_type: 'DNS.ton' | 'DNS.tg' | 'NUMBER.tg' | 'getgems';
  amount: Price;
  nft?: NftItem;
  beneficiary: AccountAddress;
  bidder: AccountAddress;
}

export interface DepositStakeAction {
  /**
   * @format int64
   * @example 1660050553
   */
  amount: number;
  staker: AccountAddress;
}

export interface RecoverStakeAction {
  /**
   * @format int64
   * @example 1660050553
   */
  amount: number;
  staker: AccountAddress;
}

export interface STONfiSwapAction {
  /** @example "1660050553" */
  amount_in: string;
  /** @example "1660050553" */
  amount_out: string;
  user_wallet: AccountAddress;
  stonfi_router: AccountAddress;
  /** @example "0:dea8f638b789172ce36d10a20318125e52c649aa84893cd77858224fe2b9b0ee" */
  jetton_wallet_in: string;
  jetton_master_in: JettonPreview;
  /** @example "0:dea8f638b789172ce36d10a20318125e52c649aa84893cd77858224fe2b9b0ee" */
  jetton_wallet_out: string;
  jetton_master_out: JettonPreview;
}

export interface NftPurchaseAction {
  auction_type: 'DNS.tg' | 'getgems' | 'basic';
  amount: Price;
  nft: NftItem;
  seller: AccountAddress;
  buyer: AccountAddress;
}

/** shortly describes what this action is about. */
export interface ActionSimplePreview {
  /** @example "Ton Transfer" */
  name: string;
  /** @example "Transferring 5 Ton" */
  description: string;
  /** a link to an image for this particular action. */
  action_image?: string;
  /** @example "5 Ton" */
  value?: string;
  /** a link to an image that depicts this action's asset. */
  value_image?: string;
  accounts: AccountAddress[];
}

/** An event is built on top of a trace which is a series of transactions caused by one inbound message. TonAPI looks for known patterns inside the trace and splits the trace into actions, where a single action represents a meaningful high-level operation like a Jetton Transfer or an NFT Purchase. Actions are expected to be shown to users. It is advised not to build any logic on top of actions because actions can be changed at any time. */
export interface AccountEvent {
  /** @example "e8b0e3fee4a26bd2317ac1f9952fcdc87dc08fdb617656b5202416323337372e" */
  event_id: string;
  account: AccountAddress;
  /**
   * @format int64
   * @example 1234567890
   */
  timestamp: number;
  actions: Action[];
  /**
   * scam
   * @example false
   */
  is_scam: boolean;
  /**
   * @format int64
   * @example 25713146000001
   */
  lt: number;
  /**
   * Event is not finished yet. Transactions still happening
   * @example false
   */
  in_progress: boolean;
  /**
   * TODO
   * @format int64
   * @example 3
   */
  extra: number;
}

export interface AccountEvents {
  events: AccountEvent[];
  /**
   * @format int64
   * @example 25713146000001
   */
  next_from: number;
}

export interface TraceId {
  /** @example "55e8809519cd3c49098c9ee45afdafcea7a894a74d0f628d94a115a50e045122" */
  id: string;
  /**
   * @format int64
   * @example 1645544908
   */
  utime: number;
}

export interface TraceIds {
  traces: TraceId[];
}

export interface ApyHistory {
  apy: number;
  time: number;
}

export interface Subscription {
  /** @example "0:dea8f638b789172ce36d10a20318125e52c649aa84893cd77858224fe2b9b0ee" */
  address: string;
  /** @example "0:567DE86AF2B6A557D7085807CF7C26338124987A5179344F0D0FA2657EB710F1" */
  wallet_address: string;
  /** @example "0:c704dadfabac88eab58e340de03080df81ff76636431f48624ad6e26fb2da0a4" */
  beneficiary_address: string;
  /**
   * @format int64
   * @example 1000000000
   */
  amount: number;
  /**
   * @format int64
   * @example 2592000
   */
  period: number;
  /**
   * @format int64
   * @example 1653996832
   */
  start_time: number;
  /**
   * @format int64
   * @example 10800
   */
  timeout: number;
  /**
   * @format int64
   * @example 1653996834
   */
  last_payment_time: number;
  /**
   * @format int64
   * @example 0
   */
  last_request_time: number;
  /**
   * @format int64
   * @example 217477
   */
  subscription_id: number;
  /**
   * @format int32
   * @example 0
   */
  failed_attempts: number;
}

export interface Subscriptions {
  subscriptions: Subscription[];
}

export interface Auction {
  /** @example "wallet.ton" */
  domain: string;
  /** @example "owner" */
  owner: string;
  /**
   * @format int64
   * @example 1660050553
   */
  price: number;
  /**
   * @format int64
   * @example 1660050553
   */
  bids: number;
  /**
   * @format int64
   * @example 1660050553
   */
  date: number;
}

export interface Auctions {
  data: Auction[];
  /**
   * @format int64
   * @example 1660050553
   */
  total: number;
}

export interface WalletDNS {
  /** @example "0:da6b1b6663a0e4d18cc8574ccd9db5296e367dd9324706f3bbd9eb1cd2caf0bf" */
  address: string;
  /** @example true */
  is_wallet: boolean;
  /** @example true */
  has_method_pubkey: boolean;
  /** @example true */
  has_method_seqno: boolean;
  names: string[];
}

export interface DomainInfo {
  name: string;
  /** date of expiring. optional. not all domain in ton has expiration date */
  expiring_at?: number;
  item?: NftItem;
}

export interface DnsRecord {
  wallet?: WalletDNS;
  /** @example "0:da6b1b6663a0e4d18cc8574ccd9db5296e367dd9324706f3bbd9eb1cd2caf0bf" */
  next_resolver?: string;
  sites: string[];
  /**
   * tonstorage bag id
   * @example "da6b1b6663a0e4d18cc8574ccd9db5296e367dd9324706f3bbd9eb1cd2caf0bf"
   */
  storage?: string;
}

export interface NftCollection {
  /** @example "0:FD595F36B4C1535BEC8461490D38EBB9AE3C38DD6ACE17CA63ABE2C6608BE159" */
  address: string;
  /**
   * @format int64
   * @example 1
   */
  next_item_index: number;
  owner?: AccountAddress;
  /** @example "697066733a2f2f516d596e437861746f5178433571584b79773971656768415853626f3544644e6a32387631487669437a47355359" */
  raw_collection_content: string;
  /** @example {} */
  metadata?: Record<string, any>;
}

export interface NftCollections {
  nft_collections: NftCollection[];
}

export interface Trace {
  transaction: Transaction;
  /** @example ["wallet","tep62_item"] */
  interfaces: string[];
  children?: Trace[];
}

export interface MessageConsequences {
  trace: Trace;
  /** Risk specifies assets that could be lost if a message would be sent to a malicious smart contract. It makes sense to understand the risk BEFORE sending a message to the blockchain. */
  risk: Risk;
  /** An event is built on top of a trace which is a series of transactions caused by one inbound message. TonAPI looks for known patterns inside the trace and splits the trace into actions, where a single action represents a meaningful high-level operation like a Jetton Transfer or an NFT Purchase. Actions are expected to be shown to users. It is advised not to build any logic on top of actions because actions can be changed at any time. */
  event: AccountEvent;
}

/** Risk specifies assets that could be lost if a message would be sent to a malicious smart contract. It makes sense to understand the risk BEFORE sending a message to the blockchain. */
export interface Risk {
  /**
   * transfer all the remaining balance of the wallet.
   * @example true
   */
  transfer_all_remaining_balance: boolean;
  /**
   * @format int64
   * @example 500
   */
  ton: number;
  jettons: JettonQuantity[];
  nfts: NftItem[];
}

export interface JettonQuantity {
  /** @example 597968399 */
  quantity: string;
  wallet_address: AccountAddress;
  jetton: JettonPreview;
}

export interface Event {
  /** @example "e8b0e3fee4a26bd2317ac1f9952fcdc87dc08fdb617656b5202416323337372e" */
  event_id: string;
  /**
   * @format int64
   * @example 1234567890
   */
  timestamp: number;
  actions: Action[];
  value_flow: ValueFlow[];
  /**
   * scam
   * @example false
   */
  is_scam: boolean;
  /**
   * @format int64
   * @example 25713146000001
   */
  lt: number;
  /**
   * Event is not finished yet. Transactions still happening
   * @example false
   */
  in_progress: boolean;
}

export interface JettonMetadata {
  /** @example "0:0BB5A9F69043EEBDDA5AD2E946EB953242BD8F603FE795D90698CEEC6BFC60A0" */
  address: string;
  /** @example "Wrapped TON" */
  name: string;
  /** @example "WTON" */
  symbol: string;
  /** @example "9" */
  decimals: string;
  /** @example "https://cache.tonapi.io/images/jetton.jpg" */
  image?: string;
  /** @example "Wrapped Toncoin" */
  description?: string;
  social?: string[];
  websites?: string[];
  catalogs?: string[];
}

export interface Jettons {
  jettons: JettonInfo[];
}

export interface JettonInfo {
  /** @example true */
  mintable: boolean;
  /** @example 311500000000000 */
  total_supply: string;
  metadata: JettonMetadata;
  verification: JettonVerificationType;
}

export interface AccountStaking {
  pools: AccountStakingInfo[];
}

export interface AccountStakingInfo {
  /** @example "EQBI-wGVp_x0VFEjd7m9cEUD3tJ_bnxMSp0Tb9qz757ATEAM" */
  pool: string;
  /**
   * @format int64
   * @example 10050000000000
   */
  amount: number;
  /**
   * @format int64
   * @example 500000000000
   */
  pending_deposit: number;
  /**
   * @format int64
   * @example 500000000000
   */
  pending_withdraw: number;
  /**
   * @format int64
   * @example 500000000000
   */
  ready_withdraw: number;
}

export interface PoolInfo {
  /** @example "0:48fb0195a7fc7454512377b9bd704503ded27f6e7c4c4a9d136fdab3ef9ec04c" */
  address: string;
  /** @example "Tonkeeper pool" */
  name: string;
  /** @format int64 */
  total_amount: number;
  implementation: 'whales' | 'tf' | 'liquidTF';
  /**
   * APY in percent
   * @example 5.31
   */
  apy: number;
  /**
   * @format int64
   * @example 5000000000
   */
  min_stake: number;
  /**
   * current nomination cycle beginning timestamp
   * @format int64
   * @example 1678223064
   */
  cycle_start: number;
  /**
   * current nomination cycle ending timestamp
   * @format int64
   * @example 1678223064
   */
  cycle_end: number;
  /**
   * this pool has verified source code or managed by trusted company
   * @example true
   */
  verified: boolean;
  /**
   * current number of nominators
   * @example 10
   */
  current_nominators: number;
  /**
   * maximum number of nominators
   * @example 100
   */
  max_nominators: number;
  /**
   * for liquid staking master account of jetton
   * @example "0:4a91d32d0289bda9813ae00ff7640e6c38fdce76e4583dd6afc463b70c7d767c"
   */
  liquid_jetton_master?: string;
}

export interface PoolImplementation {
  /** @example "TON Whales" */
  name: string;
  /** @example "Oldest pool with minimal staking amount 50 TON" */
  description: string;
  /** @example "https://tonvalidators.org/" */
  url: string;
}

export interface StorageProvider {
  /** @example "0:FD595F36B4C1535BEC8461490D38EBB9AE3C38DD6ACE17CA63ABE2C6608BE159" */
  address: string;
  /** @example true */
  accept_new_contracts: boolean;
  /**
   * @format int64
   * @example 50000000
   */
  rate_per_mb_day: number;
  /**
   * @format int64
   * @example 604800
   */
  max_span: number;
  /**
   * @format int64
   * @example 64
   */
  minimal_file_size: number;
  /**
   * @format int64
   * @example 10485760
   */
  maximal_file_size: number;
}

export interface FoundAccounts {
  addresses: {
    /** @example "0:010cеeac44fad23417a5c55e4071796868771082с9a61e8c195a8d57508b8471" */
    address: string;
    /** @example "blah_blah.ton" */
    name: string;
  }[];
}

export interface DnsExpiring {
  items: {
    /**
     * @format int64
     * @example "1678275313"
     */
    expiring_at: number;
    /** @example "blah_blah.ton" */
    name: string;
    dns_item?: NftItem;
  }[];
}

export interface AccountInfoByStateInit {
  /** @example "NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODQ3..." */
  public_key: string;
  /** @example "0:97146a46acc2654y27947f14c4a4b14273e954f78bc017790b41208b0043200b" */
  address: string;
}

export interface Seqno {
  /** @format uint32 */
  seqno: number;
}
