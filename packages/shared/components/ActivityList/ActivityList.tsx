import { DefaultSectionT, SectionListData, StyleSheet, View } from 'react-native';
import { formatTransactionsGroupDate } from '../../utils/date';
import { renderActionItem } from './ActionListItemByType';
import { memo, useMemo } from 'react';
import {
  RefreshControl,
  Screen,
  Loader,
  List,
  Spacer,
  Text,
  Button,
  copyText,
} from '@tonkeeper/uikit';
import { ActivitySection } from '@tonkeeper/mobile/src/wallet/models/ActivityModel';

type ListComponentType = React.ComponentType<any> | React.ReactElement | null | undefined;

interface ActivityListProps {
  sections: ActivitySection[];
  onLoadMore?: () => void;
  onReload?: () => void;
  hasMore?: boolean;
  isReloading?: boolean;
  isLoading?: boolean;
  error?: null | string;
  ListHeaderComponent?: ListComponentType;
  ListFooterComponent?: ListComponentType;
  ListLoaderComponent?: ListComponentType;
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
    ListLoaderComponent,
    hasMore,
    onLoadMore,
    isReloading,
    onReload,
    isLoading,
    sections,
    error,
  } = props;

  const ListEmptyComponent = useMemo(() => {
    if (error !== undefined && error !== null) {
      return (
        <View style={styles.emptyContainer}>
          <Text type="h2" textAlign="center">
            Something went wrong!
          </Text>
          <Spacer y={4} />
          <View style={styles.emptyButtons}>
            <Button title="Reload" onPress={onReload} color="secondary" size="small" />
            <Spacer x={12} />
            <Button
              title="Copy log"
              onPress={copyText(error)}
              color="secondary"
              size="small"
            />
          </View>
        </View>
      );
    } else if (isLoading && ListLoaderComponent) {
      return ListLoaderComponent;
    } else if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <Loader size="medium" />
        </View>
      );
    }

    return null;
  }, [isLoading, ListLoaderComponent]);

  const ListFooterComponent = useMemo(() => {
    if (hasMore && sections && sections.length > 0) {
      return (
        <View style={styles.moreLoader}>
          <Loader size="medium" />
        </View>
      );
    }

    return null;
  }, [hasMore, sections]);

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
      initialNumToRender={1}
      stickySectionHeadersEnabled={false}
      windowSize={16}
      sections={sections}
      decelerationRate="normal"
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
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
    paddingTop: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButtons: {
    flexDirection: 'row',
    marginTop: 24,
  },
});
