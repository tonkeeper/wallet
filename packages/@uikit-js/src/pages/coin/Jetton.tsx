import { useInfiniteQuery } from '@tanstack/react-query';
import {
  JettonApi,
  JettonBalance,
  JettonInfo,
} from '@tonkeeper/core-js/src/tonApi';
import React, { FC, useMemo } from 'react';
import { ActivityGroupRaw } from '../../components/activity/ActivityGroup';
import { Action, ActionsRow } from '../../components/home/Actions';
import { SendIcon } from '../../components/home/HomeIcons';
import { ReceiveAction } from '../../components/home/ReceiveAction';
import { CoinInfo } from '../../components/jettons/Info';
import {
  CoinHistorySkeleton,
  CoinSkeleton,
  HistoryBlock,
} from '../../components/Skeleton';
import { SubHeader } from '../../components/SubHeader';
import { useAppContext } from '../../hooks/appContext';
import {
  formatFiatCurrency,
  getJettonStockAmount,
  getJettonStockPrice,
  useFormatCoinValue,
} from '../../hooks/balance';
import { useTranslation } from '../../hooks/translation';
import { JettonKey, QueryKey } from '../../libs/queryKey';
import { ActivityGroup, groupActivity } from '../../state/activity';
import { useJettonBalance, useJettonInfo } from '../../state/jetton';
import { useTonenpointStock } from '../../state/tonendpoint';

const JettonHistory: FC<{ info: JettonInfo; balance: JettonBalance }> = ({
  balance,
}) => {
  const { tonApi } = useAppContext();

  const { fetchNextPage, hasNextPage, isFetchingNextPage, data, ...result } =
    useInfiniteQuery({
      queryKey: [
        balance.walletAddress.address,
        QueryKey.activity,
        JettonKey.history,
      ],
      queryFn: ({ pageParam = undefined }) =>
        new JettonApi(tonApi).getJettonHistory({
          account: balance.walletAddress.address,
          limit: 100,
          // TODO Api do not handle "nextFrom" param
        }),
      getNextPageParam: (lastPage) => lastPage.nextFrom,
    });

  const items = useMemo<ActivityGroup[]>(() => {
    return data ? groupActivity(data) : [];
  }, [data]);

  if (items.length === 0) {
    return <CoinHistorySkeleton />;
  }

  return (
    <HistoryBlock>
      <ActivityGroupRaw items={items} />
    </HistoryBlock>
  );
};

export const JettonContent: FC<{ jettonAddress: string }> = ({
  jettonAddress,
}) => {
  const { t } = useTranslation();
  const { tonendpoint, fiat } = useAppContext();
  const { data: info } = useJettonInfo(jettonAddress);
  const { data: balance } = useJettonBalance(jettonAddress);
  const { data: stock } = useTonenpointStock(tonendpoint);

  const format = useFormatCoinValue();

  const [price, total] = useMemo(() => {
    if (!stock || !balance) return [undefined, undefined] as const;
    const price = getJettonStockPrice(balance, stock.today, fiat);
    if (!price) return [undefined, undefined] as const;
    const amount = getJettonStockAmount(balance, price);
    return [
      formatFiatCurrency(fiat, price),
      amount ? formatFiatCurrency(fiat, amount) : undefined,
    ];
  }, [balance, stock, fiat]);

  if (!info || !balance || !stock) {
    return <CoinSkeleton />;
  }

  const amount = balance?.balance
    ? format(balance?.balance, info.metadata.decimals)
    : '-';

  console.log(info);

  const { description, image, name } = info.metadata;

  return (
    <div>
      <SubHeader title={name} />
      <CoinInfo
        amount={amount}
        symbol={info.metadata.symbol}
        price={total}
        description={description}
        image={image}
      />
      <ActionsRow>
        <Action
          icon={<SendIcon />}
          title={t('wallet_send')}
          action={() => null}
        />
        <ReceiveAction />
      </ActionsRow>

      <JettonHistory info={info} balance={balance} />
    </div>
  );
};
