import { StyleSheet, View } from 'react-native';
import { Screen, Loader, List, Spacer, RefreshControl } from '@tonkeeper/uikit';
import { TransactionItem } from './TransactionItem';
import { memo } from 'react';
import {
  MappedEvent,
  MappedEventItemType,
} from '@tonkeeper/shared/mappers/AccountEventsMapper';

interface TransactionsListProps {
  events: MappedEvent[];
  onFetchMore?: () => void;
  onRefresh?: () => void;
  fetchMoreEnd?: boolean;
  refreshing?: boolean;
  loading?: boolean;
  safeArea?: boolean;
  estimatedItemSize?: number;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
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

export const TransactionsList = memo<TransactionsListProps>(
  (props) => {
    const {
      ListHeaderComponent,
      estimatedItemSize = 76,
      fetchMoreEnd,
      onFetchMore,
      refreshing,
      onRefresh,
      safeArea,
      loading,
      events,
    } = props;

    return (
      <Screen.FlashList
        refreshControl={
          <RefreshControl
            onRefresh={onRefresh}
            refreshing={!!refreshing}
          />
        }
        estimatedItemSize={estimatedItemSize}
        keyExtractor={(item) => item.id}
        onEndReachedThreshold={0.02}
        onEndReached={onFetchMore}
        renderItem={RenderItem}
        windowSize={16}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={60}
        initialNumToRender={20} 
        data={events}
        safeArea={safeArea}
        decelerationRate="normal"
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <Loader size="medium" />
            </View>
          ) : undefined
        }
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={
          props.ListFooterComponent ?? <Footer loading={!fetchMoreEnd && loading === false} />
        }
      />
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.events.length !== nextProps.events.length) {
      return false;
    }

    const prevEvent = prevProps.events[0];
    const nextEvent = nextProps.events[0];

    if (prevEvent?.id !== nextEvent?.id) {
      return false;
    }

    if (
      prevEvent?.contentType === MappedEventItemType.Action &&
      nextEvent?.contentType === MappedEventItemType.Action
    ) {
      if (prevEvent.inProgress !== nextEvent.inProgress) {
        return false;
      }
    }

    return true;
  },
);

const Footer = memo(({ loading }: { loading: boolean }) => {
  if (loading) {
    return (
      <View style={styles.moreLoader}>
        <Loader size="medium" />
      </View>
    );
  }

  return null;
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
    paddingTop: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
