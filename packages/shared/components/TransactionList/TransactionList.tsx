import { View } from 'react-native';
import { Screen, Loader, Steezy, List } from '@tonkeeper/uikit';
import { memo } from 'react';
import { TransactionItem } from './TransactionItem';
import { ClientEvent, ClientEventType } from './DataTypes';

interface EventsListProps {
  events: ClientEvent[];
  onFetchMore?: () => void;
  estimatedItemSize?: number;
}

type TransactionRenderItemOptions = {
  item: ClientEvent;
};

function RenderItem({ item }: TransactionRenderItemOptions) {
  switch (item.type) {
    case ClientEventType.Date:
      return <List.Header title={item.date} style={styles.date} />;
    case ClientEventType.Action:
      return (
        <TransactionItem item={item} />
      );
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
        <View style={styles.moreLoader.static}>
          <Loader size="medium" />
        </View>
      }
    />
  );
});

const styles = Steezy.create({
  date: {
    marginHorizontal: 16,
  },
  moreLoader: {
    paddingTop: 8,
    paddingBottom: 16,
  }
});