import { useCallback, useMemo } from 'react';
import { useTheme } from './useTheme';
import { useStakingState } from '@tonkeeper/shared/hooks';
import { tk } from '$wallet';
import { StakingApiStatus } from '$wallet/managers/StakingManager';

export const useStakingRefreshControl = () => {
  const theme = useTheme();

  const isRefreshing = useStakingState((s) => s.status === StakingApiStatus.Refreshing);

  const handleRefresh = useCallback(() => {
    tk.wallet.staking.load();
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
