import { useExternalState } from '../../hooks/useExternalState';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { useMemo } from 'react';

export interface UseTonInscriptionParams {
  ticker: string;
  type: string;
}

export const useTonInscription = (params: UseTonInscriptionParams) => {
  const state = useExternalState(tk.wallet.tonInscriptions.state);

  return useMemo(() => {
    return state.items.find(
      (item) => item.ticker === params.ticker && item.type === params.type,
    )!;
  }, [state.items, params]);
};
