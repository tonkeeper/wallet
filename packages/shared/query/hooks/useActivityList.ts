import { State } from '@tonkeeper/core';
import { useExternalState } from '../../hooks/useExternalState';
import { tk } from '../../tonkeeper';
import { useEffect } from 'react';

export const useActivityList = () => {
  const state = useExternalState(
    tk.wallet?.activityList.state ??
      new State({
        isReloading: false,
        isLoading: false,
        hasMore: true,
        sections: [],
      }),
  );

  useEffect(() => {
    tk.wallet?.activityList.load();
  }, []);

  return {
    loadMore: () => tk.wallet?.activityList.loadMore(),
    reload: () => tk.wallet?.activityList.reload(),
    isReloading: state.isReloading,
    isLoading: state.isLoading,
    sections: state.sections,
    hasMore: state.hasMore,
  };
};
