export const TEST = 1;

export const ServerConfigVersion = 1;

export const GOOGLE_PACKAGE_NAME = 'com.ton_keeper';
export const APPLE_STORE_ID = '1587742107';

export enum DomainsForDeepLinking {
  TON = 'ton://',
}

export const API_SECRET = 'wZE12R1QxsJcWzZaBHXVYKpbjYYv9UxREmAKEc4';

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

export type CryptoCurrency = typeof CryptoCurrencies[keyof typeof CryptoCurrencies];

export enum FiatCurrencies {
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
}

export type FiatCurrency = typeof FiatCurrencies[keyof typeof FiatCurrencies];

export enum SelectableVersions {
  V4R2 = 'v4R2',
  V4R1 = 'v4R1',
  V3R2 = 'v3R2',
  V3R1 = 'v3R1',
}

export type SelectableVersion =
  typeof SelectableVersions[keyof typeof SelectableVersions];

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
  [FiatCurrencies.Usd]: {
    symbol: '$',
    side: 'start',
  },
  [FiatCurrencies.Eur]: {
    symbol: '€',
    side: 'start',
  },
  [FiatCurrencies.Rub]: {
    symbol: '₽',
    side: 'end',
  },
  [FiatCurrencies.Aed]: {
    symbol: 'DH',
    side: 'end',
  },
  [FiatCurrencies.Gbp]: {
    symbol: '£',
    side: 'start',
  },
  [FiatCurrencies.Chf]: {
    symbol: '₣',
    side: 'start',
  },
  [FiatCurrencies.Cny]: {
    symbol: '¥',
    side: 'start',
  },
  [FiatCurrencies.Krw]: {
    symbol: '₩',
    side: 'start',
  },
  [FiatCurrencies.Idr]: {
    symbol: 'Rp',
    side: 'end',
  },
  [FiatCurrencies.Inr]: {
    symbol: '₹',
    side: 'start',
  },
  [FiatCurrencies.Jpy]: {
    symbol: '¥',
    side: 'start',
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
