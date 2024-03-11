import { useExternalState } from '../../hooks/useExternalState';
import { State } from '@tonkeeper/core';
import { useEffect } from 'react';
import { useWallet } from '../../hooks';

export const useJettonActivityList = (jettonId: string) => {
  const wallet = useWallet();
  const state = useExternalState(
    wallet?.jettonActivityList.state ??
      new State({
        isReloading: false,
        isLoading: false,
        hasMore: true,
        sections: [],
        error: null,
      }),
  );

  useEffect(() => {
    wallet?.jettonActivityList.load(jettonId);
    return () => wallet?.jettonActivityList.clear();
  }, []);

  return {
    loadMore: () => wallet?.jettonActivityList.loadMore(jettonId),
    reload: () => wallet?.jettonActivityList.reload(jettonId),
    isReloading: state.isReloading,
    isLoading: state.isLoading,
    sections: state.sections[jettonId] ?? [],
    hasMore: state.hasMore,
    error: state.error,
  };
};
