import { useExternalState } from '../../hooks/useExternalState';
import { tk } from '../../tonkeeper';
import { useEffect } from 'react';

export const useActivityList = () => {
  if (!tk.wallet) {
    return {
      loadMore: () => {},
      reload: () => {},
      isReloading: false,
      isLoading: false,
      sections: [],
      hasMore: false,
    }
  }

  const state = useExternalState(tk.wallet?.activityList.state);

  useEffect(() => {
    tk.wallet.activityList.load();
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
