import React, { FC, memo, useCallback, useEffect } from 'react';
import { useTranslator } from '$hooks';
import { useAppsListStore } from '$store';
import { AppsList } from '../AppsList/AppsList';
import { openDAppBrowser } from '$navigation';

const PopularAppsComponent: FC = () => {
  const {
    fetching,
    appsList,
    moreEnabled,
    moreUrl,
    actions: { fetchPopularApps },
  } = useAppsListStore();

  const t = useTranslator();

  const handleMorePress = useCallback(() => {
    if (!moreUrl || !moreEnabled) {
      return;
    }

    openDAppBrowser(moreUrl);
  }, [moreEnabled, moreUrl]);

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
      moreEnabled={moreEnabled}
      onMorePress={handleMorePress}
    />
  );
};

export const PopularApps = memo(PopularAppsComponent);
