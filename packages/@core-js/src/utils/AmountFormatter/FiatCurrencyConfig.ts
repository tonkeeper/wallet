export enum WalletCurrency {
  TON = 'ton',
  USD = 'usd',
  EUR = 'eur',
  RUB = 'rub',
  AED = 'aed',
  GBP = 'gbp',
  CHF = 'chf',
  CNY = 'cny',
  KRW = 'krw',
  IDR = 'idr',
  INR = 'inr',
  JPY = 'jpy',
  UAH = 'uah',
  KZT = 'kzt',
  UZS = 'uzs',
  IRR = 'irr',
  BRL = 'brl',
  CAD = 'cad',
  BYN = 'byn',
  SGD = 'sgd',
  THB = 'thb',
  VND = 'vnd',
  NGN = 'ngn',
  BDT = 'bdt',
  TRY = 'try',
  ILS = 'ils',
  DKK = 'dkk',
  GEL = 'gel',
}

export const FiatCurrencySymbolsConfig = {
  [WalletCurrency.TON]: {
    symbol: 'TON',
    side: 'end',
  },
  [WalletCurrency.USD]: {
    symbol: '$',
    side: 'start',
  },
  [WalletCurrency.EUR]: {
    symbol: '€',
    side: 'start',
  },
  [WalletCurrency.RUB]: {
    symbol: '₽',
    side: 'end',
  },
  [WalletCurrency.IDR]: {
    symbol: 'Rp',
    side: 'end',
  },
  [WalletCurrency.UAH]: {
    symbol: '₴',
    side: 'end',
  },
  [WalletCurrency.UZS]: {
    symbol: 'Sum',
    side: 'end',
  },
  [WalletCurrency.INR]: {
    symbol: '₹',
    side: 'start',
  },
  [WalletCurrency.GBP]: {
    symbol: '£',
    side: 'start',
  },
  [WalletCurrency.AED]: {
    symbol: 'DH',
    side: 'end',
  },
  [WalletCurrency.CNY]: {
    symbol: '¥',
    side: 'start',
  },
  // [WalletCurrency.IRR]: {
  //   symbol: '₸',
  //   side: 'end',
  // },
  [WalletCurrency.BYN]: {
    symbol: 'Br',
    side: 'end',
  },
  [WalletCurrency.BRL]: {
    symbol: 'R$',
    side: 'start',
  },
  [WalletCurrency.TRY]: {
    symbol: '₺',
    side: 'end',
  },
  [WalletCurrency.KZT]: {
    symbol: '₸',
    side: 'end',
  },
  [WalletCurrency.NGN]: {
    symbol: '₦',
    side: 'end',
  },
  [WalletCurrency.KRW]: {
    symbol: '₩',
    side: 'start',
  },
  [WalletCurrency.THB]: {
    symbol: '฿',
    side: 'end',
  },
  [WalletCurrency.BDT]: {
    symbol: '৳',
    side: 'end',
  },
  [WalletCurrency.CHF]: {
    symbol: '₣',
    side: 'start',
  },
  [WalletCurrency.JPY]: {
    symbol: '¥',
    side: 'start',
  },
  [WalletCurrency.CAD]: {
    symbol: '$',
    side: 'end',
  },
  [WalletCurrency.ILS]: {
    symbol: '₪',
    side: 'end',
  },
  [WalletCurrency.GEL]: {
    symbol: '₾',
    side: 'end',
  },
  [WalletCurrency.VND]: {
    symbol: '₫',
    side: 'end',
  },
};
