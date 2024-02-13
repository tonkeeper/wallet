import { useExternalState } from '../../hooks/useExternalState';
import { State } from '@tonkeeper/core';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { useWallet } from '../../hooks';

export const useTonInscriptions = () => {
  const wallet = useWallet();
  const state = useExternalState(
    wallet?.tonInscriptions.state ??
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
