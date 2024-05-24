import { AddressFormats } from '@tonkeeper/core/src/formatters/Address';
import { WalletCurrency } from '@tonkeeper/core/src/utils/AmountFormatter/FiatCurrencyConfig';
import { WalletColor } from '@tonkeeper/uikit';

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

export enum WalletType {
  Regular = 'Regular',
  Lockup = 'Lockup',
  WatchOnly = 'WatchOnly',
  Signer = 'Signer',
  SignerDeeplink = 'SignerDeeplink',
  Ledger = 'Ledger',
}

export enum WalletContractVersion {
  v5R1 = 'v5R1',
  v4R2 = 'v4R2',
  v4R1 = 'v4R1',
  v3R2 = 'v3R2',
  v3R1 = 'v3R1',
  LockupV1 = 'lockup-0.1',
}

export enum WalletContractFeature {
  GASLESS,
}

export const WalletContractFeatures: Record<
  WalletContractVersion,
  Record<WalletContractFeature, boolean>
> = {
  [WalletContractVersion.v5R1]: {
    [WalletContractFeature.GASLESS]: true,
  },
  [WalletContractVersion.v4R2]: {
    [WalletContractFeature.GASLESS]: false,
  },
  [WalletContractVersion.v4R1]: {
    [WalletContractFeature.GASLESS]: false,
  },
  [WalletContractVersion.v3R2]: {
    [WalletContractFeature.GASLESS]: false,
  },
  [WalletContractVersion.v3R1]: {
    [WalletContractFeature.GASLESS]: false,
  },
  [WalletContractVersion.LockupV1]: {
    [WalletContractFeature.GASLESS]: false,
  },
};

export type TronAddresses = {
  proxy: string;
  owner: string;
};

export type WalletAddress = {
  tron?: TronAddresses;
  ton: AddressFormats;
};

export type StoreWalletInfo = {
  pubkey: string;
  currency: WalletCurrency;
  network: WalletNetwork;
  kind: WalletType;
};

export type TonWalletState = {
  address: TonAddress;
  allAddresses: { [key in WalletContractVersion]: TonAddress };
};

export interface TokenRate {
  fiat: number;
  ton: number;
  usd: number;
  diff_24h: string;
}

export interface WalletStyleConfig {
  name: string;
  color: WalletColor;
  emoji: string;
}

export interface WalletConfig extends WalletStyleConfig {
  identifier: string;
  pubkey: string;
  network: WalletNetwork;
  type: WalletType;
  version: WalletContractVersion;
  workchain: number;
  /** lockup */
  allowedDestinations?: string;
  configPubKey?: string;
  ledger?: {
    deviceId: string;
    deviceModel: string;
    accountIndex: number;
  };
}

export interface ImportWalletInfo {
  pubkey: string;
  version: WalletContractVersion;
  address: string;
  balance: number;
  tokens: boolean;
  accountIndex?: number;
  isAdded?: boolean;
}

export type WithWalletIdentifier<T> = T & { walletIdentifier: string };
