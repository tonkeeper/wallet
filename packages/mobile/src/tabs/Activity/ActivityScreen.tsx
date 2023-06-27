import React, { memo, useMemo, useRef } from 'react';
import { StyleSheet, View, ViewabilityConfig } from 'react-native';
import { ns } from '$utils';
import { getServerConfig } from '$shared/constants';
import { openRequireWalletModal } from '$navigation';
import { useNavigation } from '$libs/navigation';
import { useInfiniteQuery } from 'react-query';
import { network } from '$libs/network';
import { useWallet } from '../../tabs/Wallet/hooks/useWallet';
import { t } from '$translation';
import { Screen, Text, Button } from '@tonkeeper/uikit';
import { EventsMapper } from './EventMapper';
import { Events } from './Events.types';
import { HistoryItem } from './components/HistoryItem';
import { Skeleton } from '$uikit/Skeleton';

type GetAccountEvents = {
  account_id: string;
  before_lt?: number;
  limit?: number;
};

const getAccountEvents = async (params: GetAccountEvents) => {
  const host = getServerConfig('tonapiIOEndpoint');
  const authorization = `Bearer ${getServerConfig('tonApiV2Key')}`;

  const fetchParams: Omit<GetAccountEvents, 'account_id'> = { limit: 50  };

  if (params.before_lt) {
    fetchParams.before_lt = params.before_lt;
  }

  console.log('@FETCH');
  const { data } = await network.get(`${host}/v2/accounts/${params.account_id}/events`, {
    headers: { Authorization: authorization },
    params: fetchParams,
  });

  if (data.Error) {
    throw data.Error;
  }

  if (data) {
    return data;
  }
};

const useAccountEvents = () => {
  const wallet = useWallet();

  const { data, error, isLoading, isFetchingNextPage, fetchNextPage } = useInfiniteQuery<{
    events: Events;
  }>({
    queryKey: ['wallet_events'],
    getNextPageParam: ({ events }) => ({
      lastLt: events[events.length - 1].lt,
    }),
    queryFn: ({ pageParam }) =>
      getAccountEvents({
        account_id: wallet?.address.rawAddress ?? '',
        before_lt: pageParam?.lastLt ?? undefined,
      }),
  });

  console.log(data?.pages.map((e) => e.events))

  const data1 = useMemo(() => {
    return (
      data?.pages
        .map((data) => data.events).flat()
        .map((event) => ({
          ...event,
          actions: event.actions.map((action) =>
            EventsMapper(event, action.simple_preview),
          ),
        })) ?? []
    );
  }, [data]);

  return {
    fetchMore: fetchNextPage,
    isLoadingMore: isFetchingNextPage,
    isLoading: isLoading && !isFetchingNextPage,
    error,
    events: data1,
  };
};

export const ActivityScreen = memo(() => {
  const { events, error, isLoading, isLoadingMore, fetchMore } = useAccountEvents();
  const nav = useNavigation();
  const wallet = useWallet();

  console.log(events.length);

  const handlePressRecevie = React.useCallback(() => {
    if (wallet) {
      nav.go('Receive', {
        currency: 'ton',
        isFromMainScreen: true,
      });
    } else {
      openRequireWalletModal();
    }
  }, [wallet]);

  const handlePressBuy = React.useCallback(() => {
    if (wallet) {
      nav.openModal('Exchange', { category: 'buy' });
    } else {
      openRequireWalletModal();
    }
  }, [wallet]);

  if (!wallet || (!isLoading && events.length < 1)) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          <Text type="h2" style={{ textAlign: 'center', marginBottom: ns(4) }}>
            {t('activity.empty_transaction_title')}
          </Text>
          <Text type="body1" color="textSecondary">
            {t('activity.empty_transaction_caption')}
          </Text>
          <View style={styles.emptyButtons}>
            <Button
              title={t('activity.buy_toncoin_btn')}
              style={{ marginRight: ns(12) }}
              onPress={handlePressBuy}
              color="secondary"
              size="small"
            />
            <Button
              title={t('activity.receive_btn')}
              onPress={handlePressRecevie}
              color="secondary"
              size="small"
            />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Screen.LargeHeader title={t('activity.screen_title')} />
      <TransactionsList
        onFetchMore={fetchMore}
        events={events} 
      />
    </Screen>
  );
});


const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  emptyButtons: {
    flexDirection: 'row',
    marginTop: ns(24),
  },
});
