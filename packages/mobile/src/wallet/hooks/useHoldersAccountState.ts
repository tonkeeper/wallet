import { useCardsState } from '$wallet/hooks/useCardsState';
import { useEffect, useMemo } from 'react';
import { tk } from '$wallet';

export function useHoldersAccountState() {
  const isLoading = useCardsState((state) => state.accountStateLoading);
  const data = useCardsState((state) => state.accountState);

  useEffect(() => {
    tk.wallet.cards.fetchAccountState();
  }, []);

  return useMemo(() => ({ isLoading, data }), [isLoading, data]);
}
