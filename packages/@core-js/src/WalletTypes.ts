import { WalletCurrency } from './utils/AmountFormatter/FiatCurrencyConfig';

export type TonFriendlyAddress = string;
export type TonRawAddress = string;

export type TonAddress = {
  version: WalletContractVersion;
  friendly: TonFriendlyAddress;
  raw: TonRawAddress;
};

export enum WalletNetwork {
  mainnet = -239,
  testnet = -3,
}

export enum WalletKind {
  Regular = 'Regular',
  Lockup = 'Lockup',
  WatchOnly = 'WatchOnly',
}

type WalletIdentity = {
  network: WalletNetwork;
  kind: WalletKind;
};

export enum WalletContractVersion {
  v4R2 = 'v4R2',
  v4R1 = 'v4R1',
  v3R2 = 'v3R2',
  v3R1 = 'v3R1',
}

export type TronAddresses = {
  proxy: string;
  owner: string;
};

export type WalletAddresses = {
  tron: TronAddresses | null;
  ton: TonRawAddress;
};

export type StoreWalletInfo = {
  pubkey: string;
  currency: WalletCurrency;
  network: WalletNetwork;
  kind: WalletKind;
};

export type TonWalletState = {
  address: TonAddress;
  allAddresses: { [key in WalletContractVersion]: TonAddress };
};
