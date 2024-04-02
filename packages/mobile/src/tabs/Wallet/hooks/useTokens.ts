import { TokenPrice, useGetTokenPrice } from '$hooks/useTokenPrice';
import { useJettonBalances } from '$hooks/useJettonBalances';
import { formatter } from '$utils/formatter';
import { useMemo } from 'react';
import TonWeb from 'tonweb';
import { JettonVerification } from '$store/models';

type WalletAddress = {
  friendlyAddress: string;
  rawAddress: string;
  version: WalletVersion;
};

type WalletVersion = 'v3R1' | 'v4R2';

type TokenInfo = {
  address: WalletAddress;
  name?: string;
  symbol?: string;
  description?: string;
  iconUrl?: string;
  decimals: number;
  quantity: {
    value: string;
    formatted: string;
  };
  lock?: {
    formatted: string;
  };
  price: TokenPrice;
  rate: {
    price: string | null;
    total: string | null;
    total_numeric: number | null;
  };
  verification: JettonVerification;
};

export const useTonkens = (): {
  list: TokenInfo[];
  total: {
    fiat: number;
  };
} => {
  const { enabled: jettonBalances } = useJettonBalances();
  const getTokenPrice = useGetTokenPrice();

  const tokens = useMemo(() => {
    return jettonBalances.map((item) => {
      const rate = getTokenPrice(item.jettonAddress, item.balance);
      const tokenInfo: TokenInfo = {
        address: {
          friendlyAddress: new TonWeb.utils.Address(item.jettonAddress).toString(
            true,
            true,
            true,
          ),
          rawAddress: item.jettonAddress,
          version: 'v3R1',
        },
        name: item.metadata.name,
        symbol: item.metadata.symbol,
        description: item.metadata.description,
        iconUrl: item.metadata.image,
        decimals: item.metadata.decimals,
        verification: item.verification,
        quantity: {
          value: item.balance,
          formatted: formatter.format(item.balance),
        },
        lock: item.lock && {
          formatted: formatter.format(item.lock.amount),
        },
        price: rate,
        rate: {
          price: rate.formatted.fiat,
          total: rate.formatted.totalFiat,
          total_numeric: rate.totalFiat,
        },
      };

      return tokenInfo;
    }) as TokenInfo[];
  }, [jettonBalances, getTokenPrice]);

  const fiatTotal = useMemo(
    () =>
      tokens.reduce(
        (acc, token) => (token.rate.total_numeric ? acc + token.rate.total_numeric : acc),
        0,
      ),
    [tokens],
  );

  return useMemo(
    () => ({
      list: tokens,
      total: {
        fiat: fiatTotal,
      },
    }),
    [tokens, fiatTotal],
  );
};
