export enum FiatCurrencies {
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

export const FiatCurrencySymbolsConfig = {
  [FiatCurrencies.Ton]: {
    symbol: 'TON',
    side: 'end',
  },
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
  [FiatCurrencies.Idr]: {
    symbol: 'Rp',
    side: 'end',
  },
  [FiatCurrencies.Uah]: {
    symbol: '₴',
    side: 'end',
  },
  [FiatCurrencies.Uzs]: {
    symbol: 'Sum',
    side: 'end',
  },
  [FiatCurrencies.Inr]: {
    symbol: '₹',
    side: 'start',
  },
  [FiatCurrencies.Gbp]: {
    symbol: '£',
    side: 'start',
  },
  [FiatCurrencies.Aed]: {
    symbol: 'DH',
    side: 'end',
  },
  [FiatCurrencies.Cny]: {
    symbol: '¥',
    side: 'start',
  },
  /*  [FiatCurrencies.Irr]: {
    symbol: '₸',
    side: 'end',
  },*/
  [FiatCurrencies.Byn]: {
    symbol: 'Br',
    side: 'end',
  },
  [FiatCurrencies.Brl]: {
    symbol: 'R$',
    side: 'start',
  },
  [FiatCurrencies.Try]: {
    symbol: '₺',
    side: 'end',
  },
  [FiatCurrencies.Kzt]: {
    symbol: '₸',
    side: 'end',
  },
  [FiatCurrencies.Ngn]: {
    symbol: '₦',
    side: 'end',
  },
  [FiatCurrencies.Krw]: {
    symbol: '₩',
    side: 'start',
  },
  [FiatCurrencies.Thb]: {
    symbol: '฿',
    side: 'end',
  },
  [FiatCurrencies.Bdt]: {
    symbol: '৳',
    side: 'end',
  },
  [FiatCurrencies.Chf]: {
    symbol: '₣',
    side: 'start',
  },
  [FiatCurrencies.Jpy]: {
    symbol: '¥',
    side: 'start',
  },
  [FiatCurrencies.Cad]: {
    symbol: '$',
    side: 'end',
  },
  [FiatCurrencies.Ils]: {
    symbol: '₪',
    side: 'end',
  },
  [FiatCurrencies.Gel]: {
    symbol: '₾',
    side: 'end',
  },
  [FiatCurrencies.Vnd]: {
    symbol: '₫',
    side: 'end',
  },
};
