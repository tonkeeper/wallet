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

export const tonDiamondCollectionAddress = {
  mainnet: 'EQAG2BH0JlmFkbMrLEnyn2bIITaOSssd4WdisE4BdFMkZbir',
  testnet: 'EQDR1lqTwhPJKjkEbICwXBbarhxCKXqNOlRTDMMbxbqambV0',
};

export const telegramNumbersAddress = {
  mainnet: 'EQAOQdwdw8kGftJCSFgOErM1mBjYPe4DBPq8-AhF6vr9si5N',
  testnet: 'EQAOQdwdw8kGftJCSFgOErM1mBjYPe4DBPq8-AhF6vr9si5N',
};
