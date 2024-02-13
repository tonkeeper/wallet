import { useExternalState } from '../../hooks/useExternalState';
import { State } from '@tonkeeper/core';
import { useEffect } from 'react';
import { useWallet } from '../../hooks';

export const useTonActivityList = () => {
  const wallet = useWallet();
  const state = useExternalState(
    wallet?.tonActivityList.state ??
      new State({
        isReloading: false,
        isLoading: false,
        hasMore: true,
        sections: [],
        error: null,
      }),
  );

  useEffect(() => {
    wallet?.tonActivityList.load();
  }, []);

  return {
    loadMore: () => wallet?.tonActivityList.loadMore(),
    reload: () => wallet?.tonActivityList.reload(),
    isReloading: state.isReloading,
    isLoading: state.isLoading,
    sections: state.sections,
    hasMore: state.hasMore,
    error: state.error,
  };
};
