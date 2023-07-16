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
  Uah = 'uah',
  Kzt = 'kzt',
  Uzs = 'uzs',
}

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
  [FiatCurrencies.Uah]: {
    symbol: '₴',
    side: 'end',
  },
  [FiatCurrencies.Kzt]: {
    symbol: '₸',
    side: 'end',
  },
  [FiatCurrencies.Uzs]: {
    symbol: 'Sum',
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
