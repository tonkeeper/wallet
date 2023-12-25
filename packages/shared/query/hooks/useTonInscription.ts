import { useExternalState } from '../../hooks/useExternalState';
import { tk } from '../../tonkeeper';
import { useMemo } from 'react';

export const useTonInscription = (ticker: string) => {
  const state = useExternalState(tk.wallet.tonInscriptions.state);

  return useMemo(() => {
    return state.items.find((item) => item.ticker === ticker)!;
  }, [state.items, ticker]);
};
