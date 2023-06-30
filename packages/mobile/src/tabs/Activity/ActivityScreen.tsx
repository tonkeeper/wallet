import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ns } from '$utils';
import { getServerConfig } from '$shared/constants';
import { openRequireWalletModal } from '$navigation';
import { useNavigation } from '$libs/navigation';
import { useInfiniteQuery } from 'react-query';
import { network } from '$libs/network';

import { t } from '$translation';
import { Screen, Text, Button } from '@tonkeeper/uikit';
import { EventsMapper } from './EventMapper';
import { TransactionsList } from '@tonkeeper/shared/components/TransactionList'
import { walletWalletSelector } from "$store/wallet";
import { useSelector } from "react-redux";
import { ServerEvents } from './Events.types';

export type WalletAddress = {
  friendly: string;
  raw: string;
  version: string;
}

export const useWallet = (): { address: WalletAddress } | null => {
  const wallet = useSelector(walletWalletSelector);

  if (wallet && wallet.address) {
    return { 
      address: {
        friendly: wallet.address.friendlyAddress,
        raw: wallet.address.rawAddress,
        version: wallet.address.version,
      }
    };
  }

  return null;
};

//
//
//

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
    events: ServerEvents;
  }>({
    queryKey: ['wallet_events'],
    getNextPageParam: ({ events }) => ({
      lastLt: events[events.length - 1].lt,
    }),
    queryFn: ({ pageParam }) =>
      getAccountEvents({
        account_id: wallet?.address.raw ?? '',
        before_lt: pageParam?.lastLt ?? undefined,
      }),
  });

  const originalEvents = data?.pages
    .map((data) => data.events).flat();

  const events = EventsMapper(originalEvents ?? [], wallet?.address!);

  return {
    fetchMore: fetchNextPage,
    isLoadingMore: isFetchingNextPage,
    isLoading: isLoading && !isFetchingNextPage,
    error,
    events: events,
  };
};

export const ActivityScreen = memo(() => {
  const { events, error, isLoading, fetchMore } = useAccountEvents();
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
        // onFetchMore={fetchMore}
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
