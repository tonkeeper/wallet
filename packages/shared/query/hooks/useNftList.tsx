import { useExternalState } from '../../hooks/useExternalState';
import { State } from '@tonkeeper/core';
import { tk } from '../../tonkeeper';
import { useEffect } from 'react';

export function useNftList() {
  const state = useExternalState(
    tk.wallet?.nfts.state ??
      new State({
        isReloading: false,
        isLoading: false,
        hasMore: true,
        items: [],
      }),
  );

  useEffect(() => {
    tk.wallet?.nfts.load();
  }, []);

  return {
    loadMore: () => tk.wallet?.nfts.loadMore(),
    reload: () => tk.wallet?.nfts.reload(),
    isLoading: state.isLoading,
    hasMore: state.hasMore,
    items: state.items,
  };
}
