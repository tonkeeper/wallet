import { State } from '@tonkeeper/core';
import { useExternalState } from '../../hooks/useExternalState';
import { useWallet } from '../../hooks';

export const useActivityList = () => {
  const wallet = useWallet();
  const state = useExternalState(
    wallet?.activityList.state ??
      new State({
        isReloading: false,
        isLoading: false,
        hasMore: true,
        sections: [],
        error: null,
      }),
  );

  return {
    loadMore: () => wallet?.activityList.loadMore(),
    reload: () => wallet?.activityList.reload(),
    isReloading: state.isReloading,
    isLoading: state.isLoading,
    sections: state.sections,
    hasMore: state.hasMore,
    error: state.error,
  };
};
