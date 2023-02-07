import { useInfiniteQuery } from '@tanstack/react-query';
import { FiatCurrencies } from '@tonkeeper/core-js/src/entries/fiat';
import { AccountRepr, EventApi } from '@tonkeeper/core-js/src/tonApi';
import { TonendpointStock } from '@tonkeeper/core-js/src/tonkeeperApi/stock';
import { throttle } from '@tonkeeper/core-js/src/utils/common';
import BigNumber from 'bignumber.js';
import React, { useEffect, useMemo } from 'react';
import { ActivityGroupRaw } from '../../components/activity/ActivityGroup';
import { HomeActions } from '../../components/home/TonActions';
import { CoinInfo } from '../../components/jettons/Info';
import {
  CoinHistorySkeleton,
  CoinSkeleton,
  HistoryBlock,
  SkeletonList,
} from '../../components/Skeleton';
import { SubHeader } from '../../components/SubHeader';
import { useAppContext, useWalletContext } from '../../hooks/appContext';
import {
  formatDecimals,
  formatFiatCurrency,
  getTonCoinStockPrice,
  useFormatCoinValue,
} from '../../hooks/balance';
import { useTranslation } from '../../hooks/translation';
import { QueryKey } from '../../libs/queryKey';
import { ActivityGroup, groupActivity } from '../../state/activity';
import { useTonenpointStock } from '../../state/tonendpoint';
import { useWalletAccountInfo } from '../../state/wallet';

const useBalanceValue = (
  info: AccountRepr | undefined,
  stock: TonendpointStock | undefined,
  fiat: FiatCurrencies
) => {
  return useMemo(() => {
    if (!info || !stock) {
      return formatFiatCurrency(fiat, 0);
    }

    const ton = new BigNumber(info.balance).multipliedBy(
      formatDecimals(getTonCoinStockPrice(stock.today, fiat))
    );
    return formatFiatCurrency(fiat, ton);
  }, [info, stock]);
};

export const TonActivity = () => {
  const { tonApi } = useAppContext();
  const wallet = useWalletContext();

  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    data,
    isFetched,
    ...result
  } = useInfiniteQuery({
    queryKey: [wallet.active.rawAddress, QueryKey.activity],
    queryFn: ({ pageParam = undefined }) =>
      new EventApi(tonApi).accountEvents({
        account: wallet.active.rawAddress,
        limit: 20,
        beforeLt: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextFrom,
  });

  useEffect(() => {
    if (!hasNextPage) return () => {};

    const handler = throttle(() => {
      if (isFetchingNextPage) return;
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        fetchNextPage();
      }
    }, 50);

    window.addEventListener('scroll', handler);

    handler();

    return () => {
      window.removeEventListener('scroll', handler);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const items = useMemo<ActivityGroup[]>(() => {
    return data ? groupActivity(data) : [];
  }, [data]);

  if (!isFetched) {
    return <CoinHistorySkeleton />;
  }

  return (
    <HistoryBlock>
      <ActivityGroupRaw items={items} />
      {isFetchingNextPage && <SkeletonList size={3} />}
    </HistoryBlock>
  );
};
export const TonPage = () => {
  const { fiat, tonendpoint } = useAppContext();
  const { data: stock } = useTonenpointStock(tonendpoint);
  const { data: info } = useWalletAccountInfo();

  const format = useFormatCoinValue();
  const amount = info ? format(info.balance) : '0';

  const total = useBalanceValue(info, stock, fiat);

  const { t } = useTranslation();

  if (!stock || !info) {
    return <CoinSkeleton activity={4} />;
  }

  return (
    <div>
      <SubHeader title={t('Toncoin')} />
      <CoinInfo
        amount={amount}
        symbol="TON"
        price={total}
        description={t('Ton_page_description')}
        image="/img/toncoin.svg"
      />
      <HomeActions />

      <TonActivity />
    </div>
  );
};
