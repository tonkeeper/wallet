import React, { memo } from 'react';
import { Screen } from '$uikit';
import { t } from '$translation';
import { HistoryItem } from './components/HistoryItem';
import { useTransactions } from './useTransactions';

export const ActivityScreen = memo(() => {
  const { data } = useTransactions();
  
  return (
    <Screen>
      <Screen.Header large title={t('activity.screen_title')} />
      <Screen.ScrollList 
        data={data}
        estimatedItemSize={200}
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
