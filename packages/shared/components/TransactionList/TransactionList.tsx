import { StyleSheet, View } from 'react-native';
import { Screen, Loader, List, Spacer } from '@tonkeeper/uikit';
import { memo } from 'react';
import { TransactionItem } from './TransactionItem';
import { ClientEvent, ClientEventType } from './AccountEventsMapper/AccountEventsMapper.types';

interface EventsListProps {
  events: ClientEvent[];
  onFetchMore?: () => void;
  estimatedItemSize?: number;
}

type TransactionRenderItemOptions = {
  item: ClientEvent;
  index: number
};

function RenderItem({ item, index }: TransactionRenderItemOptions) {
  const isFirstElement = index === 0;
  switch (item.type) {
    case ClientEventType.Date:
      return (
        <View>
          {!isFirstElement && <Spacer y={8}/>}
          <List.Header title={item.date} style={styles.date} />       
        </View>
      );
    case ClientEventType.Action:
      return <TransactionItem item={item} />;
  }
}

export const TransactionsList = memo<EventsListProps>((props) => {
  const { events, estimatedItemSize = 500, onFetchMore } = props;

  return (
    <Screen.FlashList
      estimatedItemSize={estimatedItemSize}
      keyExtractor={(item) => item.id}
      onEndReachedThreshold={0.01}
      onEndReached={onFetchMore}
      renderItem={RenderItem}
      data={events}
      ListFooterComponent={
        <View style={styles.moreLoader}>
          <Loader size="medium" />
        </View>
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
});
