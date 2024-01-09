import { useExternalState } from '../../hooks/useExternalState';
import { State } from '@tonkeeper/core';
import { tk } from '../../tonkeeper';

export const useTonInscriptions = () => {
  const state = useExternalState(
    tk.wallet?.tonInscriptions.state ??
      new State({
        isLoading: false,
        inscriptions: [],
      }),
  );

  return {
    reload: () => tk.wallet?.tonInscriptions.getInscriptions(),
    isLoading: state.isLoading,
    items: state.items,
  };
};
