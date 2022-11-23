import React, { FC, memo, useEffect } from 'react';
import { useTranslator } from '$hooks';
import { useAppsListStore } from '$store';
import { AppsList } from '../AppsList/AppsList';

const PopularAppsComponent: FC = () => {
  const {
    fetching,
    appsList,
    actions: { fetchPopularApps },
  } = useAppsListStore();

  const t = useTranslator();

  useEffect(() => {
    fetchPopularApps();
  }, [fetchPopularApps]);

  if (!fetching && appsList.length === 0) {
    return null;
  }

  return (
    <AppsList
      title={t('browser.popular_title')}
      data={appsList}
      skeleton={fetching}
      rowsLimit={2}
      moreTitle={t('browser.explore_all')}
    />
  );
};

export const PopularApps = memo(PopularAppsComponent);
