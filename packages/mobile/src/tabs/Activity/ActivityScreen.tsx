import React, { memo, useCallback } from 'react';
import { Screen } from '$uikit';
import { t } from '$translation';
import { HistoryItem } from './components/HistoryItem';
import { useTransactions } from './useTransactions';
import { nftsActions } from '$store/nfts';
import { useDispatch } from 'react-redux';

export const ActivityScreen = memo(() => {
  const { data, isLoading, fetchMore } = useTransactions();


  return (
    <Screen>
      <Screen.Header large title={t('activity.screen_title')} />
      <Screen.ScrollList 
        data={data}
        estimatedItemSize={200}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.2}
        renderItem={({ item }) => (
          <HistoryItem 
            event={item}
            onPress={() => {}}
          />
        )}
      />
    </Screen>
  );
});