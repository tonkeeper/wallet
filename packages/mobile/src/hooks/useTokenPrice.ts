import { CryptoCurrencies } from '$shared/constants';
import { fiatCurrencySelector } from '$store/main';
import { useRatesStore } from '$store/zustand/rates';
import { TonThemeColor } from '$styled';
import { toLocaleNumber } from '$utils';
import { formatter } from '$utils/formatter';
import BigNumber from 'bignumber.js';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { shallow } from 'zustand/shallow';

export interface TokenPrice {
  amount: string;
  ton: number;
  totalTon: number;
  fiat: number;
  usd: number;
  totalFiat: number;
  fiatDiff: {
    percent: string;
    percentAbs: string;
    color: string;
    trend: string;
  };
  formatted: {
    ton: string | null;
    totalTon: string | null;
    fiat: string | null;
    totalFiat: string | null;
  };
}

export const useGetTokenPrice = () => {
  const rates = useRatesStore((s) => s.rates, shallow);
  const fiatCurrency = useSelector(fiatCurrencySelector);

  return useCallback(
    (currency: string, amount = '0'): TokenPrice => {
      if (
        [CryptoCurrencies.TonLocked, CryptoCurrencies.TonRestricted].includes(
          currency as CryptoCurrencies,
        )
      ) {
        currency = CryptoCurrencies.Ton;
      }

      const prices = rates[currency === CryptoCurrencies.Ton ? 'TON' : currency]?.prices;
      const diffs = rates[currency === CryptoCurrencies.Ton ? 'TON' : currency]?.diff_24h;

      const ton = prices?.TON ?? 0;
      const fiat = (prices?.[fiatCurrency.toUpperCase()] as number) ?? 0;
      const usd = (prices?.USD as number) ?? 0;

      const priceDiff = (diffs?.[fiatCurrency.toUpperCase()] as string) ?? null;

      const totalTon =
        new BigNumber(ton).multipliedBy(new BigNumber(amount)).toNumber() ?? 0;
      const totalFiat =
        new BigNumber(fiat).multipliedBy(new BigNumber(amount)).toNumber() ?? 0;

      let percent = priceDiff ?? '-';
      let color: TonThemeColor = 'foregroundSecondary';
      let trend: 'unknown' | 'positive' | 'negative' = 'unknown';

      if (priceDiff !== null) {
        color =
          priceDiff.startsWith('+') || priceDiff === '0'
            ? 'accentPositive'
            : 'accentNegative';
        trend = priceDiff.startsWith('+') || priceDiff === '0' ? 'positive' : 'negative';
      }

      percent = toLocaleNumber(percent);

      const fiatDiff = {
        percent,
        percentAbs: percent !== '-' ? percent.replace(/[-–]/, '') : percent,
        color,
        trend,
      };

      return {
        amount,
        ton,
        totalTon,
        fiat,
        usd,
        totalFiat,
        fiatDiff,
        formatted: {
          ton: ton ? formatter.format(ton, { currency: 'TON' }) : null,
          totalTon: totalTon ? formatter.format(totalTon, { currency: 'TON' }) : null,
          fiat: fiat ? formatter.format(fiat, { currency: fiatCurrency }) : null,
          totalFiat: totalFiat
            ? formatter.format(totalFiat, { currency: fiatCurrency })
            : null,
        },
      };
    },
    [fiatCurrency, rates],
  );
};

// NOTE: currency in friendly address format 
// TODO: Change prices map to raw address as key
export const useTokenPrice = (currency: string, amount = '0') => {
  const getTokenPrice = useGetTokenPrice();

  return useMemo(
    () => getTokenPrice(currency, amount),
    [amount, currency, getTokenPrice],
  );
};
