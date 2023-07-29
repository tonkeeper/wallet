import { RefreshControl, StyleSheet, View } from 'react-native';
import { Screen, Loader, List, Spacer, useTheme } from '@tonkeeper/uikit';
import { TransactionItem } from './TransactionItem';
import { memo } from 'react';
import {
  MappedEvent,
  MappedEventItemType,
} from '@tonkeeper/shared/mappers/AccountEventsMapper';

interface EventsListProps {
  events: MappedEvent[];
  onFetchMore?: () => void;
  onRefresh?: () => void;
  fetchMoreEnd?: boolean;
  refreshing?: boolean;
  loading?: boolean;
  estimatedItemSize?: number;
}

type TransactionRenderItemOptions = {
  item: MappedEvent;
  index: number;
};

function RenderItem({ item, index }: TransactionRenderItemOptions) {
  const isFirstElement = index === 0;
  switch (item.contentType) {
    case MappedEventItemType.Date:
      return (
        <View>
          {!isFirstElement && <Spacer y={8} />}
          <List.Header title={item.date} style={styles.date} />
        </View>
      );
    case MappedEventItemType.Action:
      return <TransactionItem item={item} />;
  }
}

export const TransactionsList = memo<EventsListProps>((props) => {
  const theme = useTheme();
  const {
    estimatedItemSize = 76,
    fetchMoreEnd,
    onFetchMore,
    refreshing,
    onRefresh,
    loading,
    events,
  } = props;

  return (
    <Screen.FlashList
      // refreshControl={
      //   <RefreshControl
      //     onRefresh={onRefresh}
      //     refreshing={!!refreshing}
      //     tintColor={theme.constantWhite}
      //     progressBackgroundColor={theme.constantWhite}
      //   />
      // }
      onRefresh={onRefresh}
      refreshing={!!refreshing}
      estimatedItemSize={estimatedItemSize}
      keyExtractor={(item) => item.id}
      onEndReachedThreshold={0.01}
      onEndReached={onFetchMore}
      renderItem={RenderItem}
      data={events}
      ListEmptyComponent={
        loading ? (
          <View style={styles.emptyContainer}>
            <Loader size="medium" />
          </View>
        ) : undefined
      }
      ListFooterComponent={
        !fetchMoreEnd && !loading ? (
          <View style={styles.moreLoader}>
            <Loader size="medium" />
          </View>
        ) : undefined
      }
    />
  );
});

const styles = StyleSheet.create({
  date: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  moreLoader: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  emptyContainer: {
    paddingTop: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
