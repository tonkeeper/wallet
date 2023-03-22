import { StakingApiStatus, useStakingStore } from '$store';
import { useCallback, useMemo } from 'react';
import { useTheme } from './useTheme';

export const useStakingRefreshControl = () => {
  const theme = useTheme();

  const isRefreshing = useStakingStore((s) => s.status === StakingApiStatus.Refreshing);

  const handleRefresh = useCallback(() => {
    useStakingStore.getState().actions.fetchPools();
  }, []);

  const refreshControl = useMemo(
    () => ({
      onRefresh: handleRefresh,
      refreshing: isRefreshing,
      tintColor: theme.colors.foregroundPrimary,
    }),
    [handleRefresh, isRefreshing, theme.colors.foregroundPrimary],
  );

  return refreshControl;
};
