export const GOOGLE_PACKAGE_NAME = 'com.ton_keeper';
export const APPLE_STORE_ID = '1587742107';

export enum CryptoCurrencies {
  Ton = 'ton',
  TonLocked = 'ton_locked',
  TonRestricted = 'ton_restricted',
  Eth = 'eth',
  Btc = 'btc',
  Usdt = 'usdt',
  Usdc = 'usdc',
  Dai = 'dai',
  Wbtc = 'wbtc',
}

export type CryptoCurrency = (typeof CryptoCurrencies)[keyof typeof CryptoCurrencies];

export enum WalletCurrency {
  Ton = 'ton',
  Usd = 'usd',
  Eur = 'eur',
  Rub = 'rub',
  Aed = 'aed',
  Gbp = 'gbp',
  Chf = 'chf',
  Cny = 'cny',
  Krw = 'krw',
  Idr = 'idr',
  Inr = 'inr',
  Jpy = 'jpy',
  Uah = 'uah',
  Kzt = 'kzt',
  Uzs = 'uzs',
  Irr = 'irr',
  Brl = 'brl',
  Cad = 'cad',
  Byn = 'byn',
  Sgd = 'sgd',
  Thb = 'thb',
  Vnd = 'vnd',
  Ngn = 'ngn',
  Bdt = 'bdt',
  Try = 'try',
  Ils = 'ils',
  Dkk = 'dkk',
  Gel = 'gel',
}

export type FiatCurrency = (typeof WalletCurrency)[keyof typeof WalletCurrency];

export enum SelectableVersions {
  V4R2 = 'v4R2',
  V4R1 = 'v4R1',
  V3R2 = 'v3R2',
  V3R1 = 'v3R1',
}

export type SelectableVersion =
  (typeof SelectableVersions)[keyof typeof SelectableVersions];

export const PrimaryCryptoCurrencies = [
  CryptoCurrencies.Ton,
  CryptoCurrencies.Eth,
  CryptoCurrencies.Btc,
];

export const SecondaryCryptoCurrencies = [
  CryptoCurrencies.Eth,
  CryptoCurrencies.Usdt,
  CryptoCurrencies.Btc,
  CryptoCurrencies.Usdc,
  CryptoCurrencies.Dai,
  // CryptoCurrencies.Wbtc,
];

export const SwapCurrencies = [
  CryptoCurrencies.Ton,
  CryptoCurrencies.Btc,
  CryptoCurrencies.Eth,
  CryptoCurrencies.Usdt,
];

export const CurrenciesIcons = {
  [CryptoCurrencies.Ton]: require('$assets/currency/ic-ton-48.png'),
  [CryptoCurrencies.TonLocked]: require('$assets/currency/ic-ton-48.png'),
  [CryptoCurrencies.TonRestricted]: require('$assets/currency/ic-ton-48.png'),
  [CryptoCurrencies.Eth]: require('$assets/currency/ic-eth-48.png'),
  [CryptoCurrencies.Btc]: require('$assets/currency/ic-btc-48.png'),
  [CryptoCurrencies.Usdt]: require('$assets/currency/ic-usdt-48.png'),
  [CryptoCurrencies.Wbtc]: require('$assets/currency/ic-wbtc-48.png'),
  [CryptoCurrencies.Usdc]: require('$assets/currency/ic-usdc-48.png'),
  [CryptoCurrencies.Dai]: require('$assets/currency/ic-dai-48.png'),
};

export const CurrencyLongName = {
  [CryptoCurrencies.Ton]: 'TON',
  [CryptoCurrencies.TonLocked]: 'TON, locked',
  [CryptoCurrencies.TonRestricted]: 'TON, restricted',
  [CryptoCurrencies.Eth]: 'Ethereum',
  [CryptoCurrencies.Btc]: 'Bitcoin',
  [CryptoCurrencies.Usdt]: 'Tether USDT',
  [CryptoCurrencies.Wbtc]: 'Wrapped Bitcoin',
  [CryptoCurrencies.Usdc]: 'USD Coin',
  [CryptoCurrencies.Dai]: 'Maker DAI',
};

export const LockupNames = {
  [CryptoCurrencies.TonLocked]: 'Locked Toncoin',
  [CryptoCurrencies.TonRestricted]: 'Restricted Toncoin',
};

export const Decimals = {
  [CryptoCurrencies.Ton]: 9,
  [CryptoCurrencies.TonLocked]: 9,
  [CryptoCurrencies.TonRestricted]: 9,
  [CryptoCurrencies.Eth]: 8,
  [CryptoCurrencies.Btc]: 8,
  [CryptoCurrencies.Usdt]: 2,
  [CryptoCurrencies.Wbtc]: 8,
  [CryptoCurrencies.Usdc]: 8,
  [CryptoCurrencies.Dai]: 8,
};

export const FiatCurrencySymbolsConfig = {
  [WalletCurrency.Ton]: {
    symbol: 'TON',
    side: 'end',
  },
  [WalletCurrency.Usd]: {
    symbol: '$',
    side: 'start',
  },
  [WalletCurrency.Eur]: {
    symbol: '€',
    side: 'start',
  },
  [WalletCurrency.Rub]: {
    symbol: '₽',
    side: 'end',
  },
  [WalletCurrency.Idr]: {
    symbol: 'Rp',
    side: 'end',
  },
  [WalletCurrency.Uah]: {
    symbol: '₴',
    side: 'end',
  },
  [WalletCurrency.Uzs]: {
    symbol: 'Sum',
    side: 'end',
  },
  [WalletCurrency.Inr]: {
    symbol: '₹',
    side: 'start',
  },
  [WalletCurrency.Gbp]: {
    symbol: '£',
    side: 'start',
  },
  [WalletCurrency.Aed]: {
    symbol: 'DH',
    side: 'end',
  },
  [WalletCurrency.Cny]: {
    symbol: '¥',
    side: 'start',
  },
  [WalletCurrency.Irr]: {
    symbol: 'IRR',
    side: 'end',
  },
  [WalletCurrency.Byn]: {
    symbol: 'Br',
    side: 'end',
  },
  [WalletCurrency.Brl]: {
    symbol: 'R$',
    side: 'start',
  },
  [WalletCurrency.Try]: {
    symbol: '₺',
    side: 'end',
  },
  [WalletCurrency.Kzt]: {
    symbol: '₸',
    side: 'end',
  },
  [WalletCurrency.Ngn]: {
    symbol: '₦',
    side: 'end',
  },
  [WalletCurrency.Krw]: {
    symbol: '₩',
    side: 'start',
  },
  [WalletCurrency.Thb]: {
    symbol: '฿',
    side: 'end',
  },
  [WalletCurrency.Bdt]: {
    symbol: '৳',
    side: 'end',
  },
  [WalletCurrency.Chf]: {
    symbol: '₣',
    side: 'start',
  },
  [WalletCurrency.Jpy]: {
    symbol: '¥',
    side: 'start',
  },
  [WalletCurrency.Cad]: {
    symbol: '$',
    side: 'end',
  },
  [WalletCurrency.Ils]: {
    symbol: '₪',
    side: 'end',
  },
  [WalletCurrency.Gel]: {
    symbol: '₾',
    side: 'end',
  },
  [WalletCurrency.Vnd]: {
    symbol: '₫',
    side: 'end',
  },
};

export const SelectableVersionsConfig = {
  [SelectableVersions.V3R1]: {
    label: 'v3R1',
  },
  [SelectableVersions.V3R2]: {
    label: 'v3R2',
  },
  [SelectableVersions.V4R1]: {
    label: 'v4R1',
  },
  [SelectableVersions.V4R2]: {
    label: 'v4R2',
  },
};

export const TokenConfig: { [index: string]: any } = {
  [CryptoCurrencies.Usdt]: {
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    blockchain: 'ethereum',
    decimals: 18,
  },
  [CryptoCurrencies.Wbtc]: {
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    blockchain: 'ethereum',
    decimals: 8,
  },
  [CryptoCurrencies.Usdc]: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    blockchain: 'ethereum',
    decimals: 8,
  },
  [CryptoCurrencies.Dai]: {
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    blockchain: 'ethereum',
    decimals: 8,
  },
};

export const TokenConfigTestnet: { [index: string]: any } = {
  [CryptoCurrencies.Usdt]: {
    address: '0x6ee856ae55b6e1a249f04cd3b947141bc146273c',
    blockchain: 'ethereum',
    decimals: 18,
  },
  [CryptoCurrencies.Wbtc]: {
    address: '0x6ee856ae55b6e1a249f04cd3b947141bc146273c', // ToDo: change to correct
    blockchain: 'ethereum',
    decimals: 8,
  },
  [CryptoCurrencies.Usdc]: {
    address: '0x6ee856ae55b6e1a249f04cd3b947141bc146273c', // ToDo: change to correct
    blockchain: 'ethereum',
    decimals: 8,
  },
  [CryptoCurrencies.Dai]: {
    address: '0x6ee856ae55b6e1a249f04cd3b947141bc146273c', // ToDo: change to correct
    blockchain: 'ethereum',
    decimals: 8,
  },
};

export function getTonBridgeAddress() {
  return 'Ef_dJMSh8riPi3BTUTtcxsWjG8RLKnLctNjAM4rw8NN-xWdr';
}

export function getTonCollectorAddress() {
  return 'EQCuzvIOXLjH2tv35gY4tzhIvXCqZWDuK9kUhFGXKLImgxT5';
}

export function getWTonAddress() {
  return '0x582d872a1b094fc48f5de31d3b73f2d9be47def1';
}

export const tonDiamondCollectionAddress = {
  mainnet: 'EQAG2BH0JlmFkbMrLEnyn2bIITaOSssd4WdisE4BdFMkZbir',
  testnet: 'EQDR1lqTwhPJKjkEbICwXBbarhxCKXqNOlRTDMMbxbqambV0',
};

export const telegramNumbersAddress = {
  mainnet: 'EQAOQdwdw8kGftJCSFgOErM1mBjYPe4DBPq8-AhF6vr9si5N',
  testnet: 'EQAOQdwdw8kGftJCSFgOErM1mBjYPe4DBPq8-AhF6vr9si5N',
};
