import { DefaultSectionT, SectionListData, StyleSheet, View } from 'react-native';
import { RefreshControl, Screen, Loader, List } from '@tonkeeper/uikit';
import { formatTransactionsGroupDate } from '../../utils/date';
import { ActionItem, ActivitySection } from '@tonkeeper/core';
import { renderActionItem } from './ActionListItemByType';
import { memo } from 'react';

interface ActivityListProps {
  sections: SectionListData<ActionItem>;
  onLoadMore?: () => void;
  onReload?: () => void;
  hasMore?: boolean;
  isReloading?: boolean;
  isLoading?: boolean;
  safeArea?: boolean;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
}

function renderSection({ section }: { section: SectionListData<any, DefaultSectionT> }) {
  const isFirstItem = false; //index === 0;
  return (
    <List.Header
      title={formatTransactionsGroupDate(section.timestamp)}
      spacerY={isFirstItem ? 8 : 0}
      style={styles.date}
    />
  );
}

export const ActivityList = memo<ActivityListProps>((props) => {
  const {
    ListHeaderComponent,
    hasMore,
    onLoadMore,
    isReloading,
    onReload,
    safeArea,
    isLoading,
    sections,
  } = props;

  return (
    <Screen.SectionList
      refreshControl={<RefreshControl onRefresh={onReload} refreshing={!!isReloading} />}
      keyExtractor={(item) => item.action_id}
      renderSectionHeader={renderSection}
      renderItem={renderActionItem}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.02}
      updateCellsBatchingPeriod={60}
      maxToRenderPerBatch={10}
      initialNumToRender={20}
      stickySectionHeadersEnabled={false}
      windowSize={16}
      sections={sections}
      safeArea={safeArea}
      decelerationRate="normal"
      ListEmptyComponent={
        isLoading ? (
          <View style={styles.emptyContainer}>
            <Loader size="medium" />
          </View>
        ) : undefined
      }
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        props.ListFooterComponent ?? (
          <Footer loading={hasMore && sections && sections.length > 0} />
        )
      }
    />
  );
});

const Footer = memo(({ loading }: { loading?: boolean }) => {
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
