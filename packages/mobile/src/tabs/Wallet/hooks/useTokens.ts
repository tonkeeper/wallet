import { useJettonBalances } from '$hooks';
import { useGetJettonPrice } from '$hooks/useJettonPrice';
import { jettonsSelector } from '$store/jettons';
import { formatter } from '$utils/formatter';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import TonWeb from 'tonweb';

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
  rate: {
    price: string | null;
    total: string | null;
  };
};

export const useTonkens = (): {
  list: TokenInfo[];
  canEdit: boolean;
} => {
  const jettonBalances = useJettonBalances();
  const allJettonBalances = useJettonBalances(true);
  const getJettonPrice = useGetJettonPrice();

  const tonkens = useMemo(() => {
    return jettonBalances.map((item) => {
      const rate = getJettonPrice(item.jettonAddress, item.balance);
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
        quantity: {
          value: item.balance,
          formatted: formatter.format(item.balance),
        },
        rate,
      };

      return tokenInfo;
    }) as TokenInfo[];
  }, [jettonBalances]);

  return {
    list: tonkens,
    canEdit: allJettonBalances.length > 0,
  };
};
