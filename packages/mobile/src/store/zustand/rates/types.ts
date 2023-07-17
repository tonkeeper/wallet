import { FiatCurrencies } from '$shared/constants';

export type TRates = Record<
  'TON' | string,
  {
    prices: Record<'TON' | Uppercase<keyof typeof FiatCurrencies>, number>;
    diff_24h: Record<'TON' | Uppercase<keyof typeof FiatCurrencies>, string>;
  }
>;

export interface IRatesStore {
  rates: TRates;
  actions: {
    fetchRates: () => Promise<void>;
  };
}
