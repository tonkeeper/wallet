import { useExternalState } from '../../hooks/useExternalState';
import { State } from '@tonkeeper/core';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { useEffect } from 'react';

export const useTonActivityList = () => {
  const state = useExternalState(
    tk.wallet?.tonActivityList.state ??
      new State({
        isReloading: false,
        isLoading: false,
        hasMore: true,
        sections: [],
        error: null,
      }),
  );

  useEffect(() => {
    tk.wallet?.tonActivityList.load();
  }, []);

  return {
    loadMore: () => tk.wallet?.tonActivityList.loadMore(),
    reload: () => tk.wallet?.tonActivityList.reload(),
    isReloading: state.isReloading,
    isLoading: state.isLoading,
    sections: state.sections,
    hasMore: state.hasMore,
    error: state.error,
  };
};
