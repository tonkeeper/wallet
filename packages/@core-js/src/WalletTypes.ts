
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

export enum WalletCurrency {
  USD = 'USD',
}

enum WalletContractVersion {
  v4R1 = 'v3R2',
  v3R2 = 'v3R2',
  v4R2 = 'v4R2',
  NA = 'NA',
}

type TronAddresses = {
  proxy: string;
  owner: string;
};

export type TonRawAddress = string;

export type WalletAddresses = {
  tron: TronAddresses | null;
  ton: TonRawAddress;
};

export type WalletState = {
  addresses: WalletAddresses;
  currency: WalletCurrency;
  network: WalletNetwork;
  kind: WalletKind;
  wallets: [];
};
