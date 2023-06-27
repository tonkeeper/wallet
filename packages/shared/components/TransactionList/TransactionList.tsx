import { memo, useRef } from 'react';

interface EventsListProps {
  events: any;
  onFetchMore?: () => void;
  estimatedItemSize?: number;
}

const TransactionsList = memo<EventsListProps>((props) => {
  const { events, estimatedItemSize = 200, onFetchMore } = props;

  const viewabilityConfig = useRef<ViewabilityConfig>({
    waitForInteraction: true,
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 1000,
  }).current;

  return (
    <Screen.FlashList
      estimatedItemSize={estimatedItemSize}
      data={events}
      keyExtractor={(item) => item.event_id}
      onEndReached={onFetchMore}
      onEndReachedThreshold={0.01}
      viewabilityConfig={viewabilityConfig}
      renderItem={({ item }) => {
        return <TransactionItem event={item} />;
      }}
      ListFooterComponent={
        <View style={{ paddingHorizontal: 16 }}>
          <Skeleton.List />
        </View>
      }
    />
  );
});
