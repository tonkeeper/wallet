import { AddressFormats } from '@tonkeeper/core/src/formatters/Address';
import { WalletCurrency } from '@tonkeeper/core/src/utils/AmountFormatter/FiatCurrencyConfig';

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
}

export enum WalletContractVersion {
  v4R2 = 'v4R2',
  v4R1 = 'v4R1',
  v3R2 = 'v3R2',
  v3R1 = 'v3R1',
  LockupV1 = 'lockup-0.1',
}

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

export interface WalletConfig {
  name: string;
  color: WalletColor;
  pubkey: string;
  network: WalletNetwork;
  type: WalletType;
  version: WalletContractVersion;
  workchain: number;
  /** lockup */
  allowedDestinations?: string;
  configPubKey?: string;
}

export enum WalletColor {
  Midnight = '#2E3847',
  Charcoal = '#424C5C',
  SilverChalice = '#9DA2A4',
  Iron = '#BABFC2',
  RadicalRed = '#FF4785',
  CarnationPink = '#FF85AD',
  SunsetOrange = '#FF4747',
  Salmon = '#FF8585',
  DarkOrange = '#FF781F',
  MacaroniAndCheese = '#FF9D5C',
  SelectiveYellow = '#FFAA00',
  Buff = '#FFCC66',
  AppleGreen = '#5EB851',
  Zucchini = '#85B87D',
  BlueRibbon = '#4785FF',
  Malibu = '#85ADFF',
  VividSkyBlue = '#33C2FF',
  FrenchSkyBlue = '#70D4FF',
  ElectricViolet = '#7E3DFF',
  LightWisteria = '#A77AFF',
  HollywoodCerise = '#FF47FF',
  Mauve = '#FF85FF',
  SteelPink = '#FF3392',
  LightOrchid = '#FF70B3',
  Bittersweet = '#FF4754',
  LightCoral = '#FF858D',
}
