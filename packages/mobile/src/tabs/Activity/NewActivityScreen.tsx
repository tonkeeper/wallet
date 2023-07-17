import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ns } from '$utils';
import { openRequireWalletModal } from '$navigation';
import { useNavigation } from '$libs/navigation';

import { t } from '$translation';
import { Screen, Text, Button } from '@tonkeeper/uikit';
import { EventsMapper } from './EventMapper';
import { TransactionsList } from '@tonkeeper/shared/components/TransactionList';
import { walletWalletSelector } from '$store/wallet';
import { useSelector } from 'react-redux';
import { AddressFormats } from '@tonkeeper/core';

import { useEventsByAccount } from '@tonkeeper/core/src/query/useEventsByAccount';

export const useWallet = () => {
  const wallet = useSelector(walletWalletSelector);

  if (wallet && wallet.address) {
    return {
      address: {
        friendly: wallet.address.friendlyAddress,
        raw: wallet.address.rawAddress,
      },
    };
  }

  return {} as { address: AddressFormats };
};

export const useMaybeWallet = () => {
  const wallet = useWallet();

  if (!wallet.address) {
    return null;
  }

  return wallet;
};

//
//
//

export const ActivityScreen = memo(() => {
  const wallet = useWallet();
  const { data, error, isLoading, fetchMore } = useEventsByAccount(wallet.address.raw);
  const nav = useNavigation();
  
  const events = EventsMapper(data ?? [], wallet?.address?.raw!);

  if (error) {
    console.error('error', error);
  }

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
      <TransactionsList onFetchMore={fetchMore} events={events} />
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
