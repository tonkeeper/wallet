import { CryptoCurrencies } from '$shared/constants';
import { TonThemeColor } from '$styled';
import { toLocaleNumber } from '$utils';
import { formatter } from '$utils/formatter';
import { Address } from '@tonkeeper/shared/Address';
import { useRates, useWalletCurrency } from '@tonkeeper/shared/hooks';
import BigNumber from 'bignumber.js';
import { useCallback, useMemo } from 'react';

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
  const rates = useRates();
  const fiatCurrency = useWalletCurrency();

  return useCallback(
    (currency: string, amount = '0'): TokenPrice => {
      if (
        [CryptoCurrencies.TonLocked, CryptoCurrencies.TonRestricted].includes(
          currency as CryptoCurrencies,
        )
      ) {
        currency = CryptoCurrencies.Ton;
      }

      const rate =
        rates[Address.isValid(currency) ? Address.parse(currency).toRaw() : currency];

      const ton = rate?.ton ?? 0;
      const fiat = rate?.fiat ?? 0;
      const usd = rate?.usd ?? 0;

      const priceDiff = rate?.diff_24h ?? null;

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
        percent: ton !== 0 && percent,
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
          ton: formatter.format(ton, { currency: 'TON' }),
          totalTon: formatter.format(totalTon, { currency: 'TON' }),
          fiat: formatter.format(fiat, { currency: fiatCurrency }),
          totalFiat: formatter.format(totalFiat, { currency: fiatCurrency }),
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
