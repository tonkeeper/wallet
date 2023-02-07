import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { CryptoCurrencies, CryptoCurrency } from '$shared/constants';
import {
  ratesRatesSelector,
  ratesYesterdayRatesSelector,
} from '$store/rates';
import { RatesMap } from '$store/rates/interface';
import { fiatCurrencySelector } from '$store/main';

export function getRate(
  rates: RatesMap,
  currency: CryptoCurrency,
  fiatCurrency: string,
): number {
  let result = 0;

  if (
    [CryptoCurrencies.TonLocked, CryptoCurrencies.TonRestricted].indexOf(currency) > -1
  ) {
    currency = CryptoCurrencies.Ton;
  }

  fiatCurrency = fiatCurrency.toUpperCase();
  const currencyUpper = currency?.toUpperCase();
  if (currencyUpper === CryptoCurrencies.Btc.toUpperCase() && rates[fiatCurrency]) {
    result = +rates[fiatCurrency];
  } else if (rates[currencyUpper]) {
    const btcPrice = rates[currencyUpper];
    const btcInFiat = rates[fiatCurrency];

    result = new BigNumber(btcInFiat).div(btcPrice).toNumber();
  }

  return result;
}

export function useFiatRate(currency: CryptoCurrency) {
  const rates = useSelector(ratesRatesSelector);
  const yesterdayRates = useSelector(ratesYesterdayRatesSelector);
  const fiatCurrency = useSelector(fiatCurrencySelector);

  return useMemo(() => {
    return {
      today: getRate(rates, currency, fiatCurrency),
      yesterday: getRate(yesterdayRates, currency, fiatCurrency),
    };
  }, [rates, currency, fiatCurrency, yesterdayRates]);
}
