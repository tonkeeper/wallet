import { useExternalState } from '../../hooks/useExternalState';
import { State } from '@tonkeeper/core';
import { tk } from '../../tonkeeper';
import { useEffect } from 'react';

export const useJettonActivityList = (jettonId: string) => {
  const state = useExternalState(
    tk.wallet?.jettonActivityList.state ??
      new State({
        isReloading: false,
        isLoading: false,
        hasMore: true,
        sections: [],
      }),
  );

  useEffect(() => {
    tk.wallet?.jettonActivityList.load(jettonId);
  }, []);

  return {
    loadMore: () => tk.wallet?.jettonActivityList.loadMore(jettonId),
    reload: () => tk.wallet?.jettonActivityList.reload(jettonId),
    isReloading: state.isReloading,
    isLoading: state.isLoading,
    sections: state.sections,
    hasMore: state.hasMore,
  };
};
