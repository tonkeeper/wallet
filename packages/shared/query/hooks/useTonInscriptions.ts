import { useExternalState } from '../../hooks/useExternalState';
import { State } from '@tonkeeper/core';
import { tk } from '@tonkeeper/mobile/src/wallet';

export const useTonInscriptions = () => {
  const state = useExternalState(
    tk.wallet?.tonInscriptions.state ??
      new State({
        isLoading: false,
        items: [],
      }),
  );

  return {
    reload: () => tk.wallet?.tonInscriptions.load(),
    isLoading: state.isLoading,
    items: state.items,
  };
};
