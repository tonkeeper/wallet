import { push, useParams } from '$navigation/imperative';
import { TronBalance } from '@tonkeeper/core/src/TronAPI/TronAPIGenerated';
import { TransactionsList } from '@tonkeeper/shared/components';
import { useTronTransactions } from '@tonkeeper/shared/query/hooks/useTronTransactions';
import { Screen } from '@tonkeeper/uikit';
import { memo } from 'react';
import { StyleSheet } from 'react-native';

export const TronTokenScreen = memo(() => {
  const { balance } = useParams<{ balance: TronBalance }>();
  const events = useTronTransactions();

  return (
    <Screen>
      <Screen.Header title={balance?.token.name} />
      <TransactionsList
        // ListHeaderComponent={}
        fetchMoreEnd={events.fetchMoreEnd}
        onFetchMore={events.fetchMore}
        refreshing={events.refreshing}
        onRefresh={events.refresh}
        loading={events.loading}
        items={events.data}
      />
    </Screen>
  );
});

const styles = StyleSheet.create({
  container: {},
});

export function openTronToken(balance: TronBalance) {
  push('TronTokenScreen', { balance });
}
