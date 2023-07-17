import { Screen, Text, Button } from '@tonkeeper/uikit';
import { StyleSheet, View } from 'react-native';
import { t } from '@tonkeeper/shared/i18n';
import React, { memo } from 'react';

import { TransactionsList } from '@tonkeeper/shared/components/TransactionList';
import { useEventsByAccount } from '@tonkeeper/core/src/query/useEventsByAccount';
import { AccountEventsMapper } from '@tonkeeper/shared/components/TransactionList/AccountEventsMapper'
import { useWallet } from '../useWallet';

// TODO: 
import { openRequireWalletModal } from '$navigation';
import { useNavigation } from '$libs/navigation';


export const ActivityScreen = memo(() => {
  const wallet = useWallet();
  const { data, error, isLoading, fetchMore } = useEventsByAccount(wallet.address.raw);

  const events = AccountEventsMapper(data ?? [], wallet.address.raw);

  const nav = useNavigation();
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
          <Text type="h2" style={{ textAlign: 'center', marginBottom: 4 }}>
            {t('activity.empty_transaction_title')}
          </Text>
          <Text type="body1" color="textSecondary">
            {t('activity.empty_transaction_caption')}
          </Text>
          <View style={styles.emptyButtons}>
            <Button
              title={t('activity.buy_toncoin_btn')}
              style={{ marginRight: 12 }}
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
    marginTop: 24,
  },
});
