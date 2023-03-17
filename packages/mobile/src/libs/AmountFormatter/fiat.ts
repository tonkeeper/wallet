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
