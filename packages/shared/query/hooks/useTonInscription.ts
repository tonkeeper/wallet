import { useExternalState } from '../../hooks/useExternalState';
import { useMemo } from 'react';
import { useWallet } from '../../hooks';

export interface UseTonInscriptionParams {
  ticker: string;
  type: string;
}

export const useTonInscription = (params: UseTonInscriptionParams) => {
  const wallet = useWallet();
  const state = useExternalState(wallet.tonInscriptions.state);

  return useMemo(() => {
    return state.items.find(
      (item) => item.ticker === params.ticker && item.type === params.type,
    )!;
  }, [state.items, params]);
};
