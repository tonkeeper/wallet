import { TransactionItem, TransactionItemType, TransactionItems } from '@tonkeeper/core';
import { formatTransactionsGroupDate } from '../../utils/date';
import { renderActionItem } from './renderActionItem';
import { StyleSheet, View } from 'react-native';
import { memo } from 'react';
import {
  ListItemContainer,
  RefreshControl,
  Screen,
  Loader,
  List,
} from '@tonkeeper/uikit';

interface TransactionsListProps {
  items?: TransactionItems;
  onFetchMore?: () => void;
  onRefresh?: () => void;
  fetchMoreEnd?: boolean;
  refreshing?: boolean;
  loading?: boolean;
  safeArea?: boolean;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
}

type RenderItemOptions = {
  item: TransactionItem;
  index: number;
};

function renderTransactionItem(options: RenderItemOptions) {
  const { item, index } = options;

  if (item.type === TransactionItemType.Section) {
    const isFirstItem = index === 0;
    return (
      <List.Header
        title={formatTransactionsGroupDate(item.timestamp)}
        spacerY={isFirstItem ? 8 : 0}
        style={styles.date}
      />
    );
  }

  return (
    <ListItemContainer isFirst={item.isFirst} isLast={item.isLast}>
      {renderActionItem(item.event, item.action)}
    </ListItemContainer>
  );
}

export const TransactionsList = memo<TransactionsListProps>((props) => {
  const {
    ListHeaderComponent,
    fetchMoreEnd,
    onFetchMore,
    refreshing,
    onRefresh,
    safeArea,
    loading,
    items,
  } = props;

  return (
    <Screen.FlashList
      refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={!!refreshing} />}
      keyExtractor={(item) => item.id}
      renderItem={renderTransactionItem}
      onEndReached={onFetchMore}
      onEndReachedThreshold={0.02}
      updateCellsBatchingPeriod={60}
      maxToRenderPerBatch={10}
      initialNumToRender={20}
      windowSize={16}
      data={items}
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
        props.ListFooterComponent ?? (
          <Footer loading={!fetchMoreEnd && loading === false} />
        )
      }
    />
  );
});

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
