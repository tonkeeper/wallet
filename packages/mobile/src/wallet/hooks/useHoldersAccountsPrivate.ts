import { useCardsState } from '$wallet/hooks/useCardsState';
import { useEffect, useMemo } from 'react';
import { tk } from '$wallet';

export function useHoldersAccountsPrivate() {
  const isLoading = useCardsState((state) => state.accountsPrivateLoading);
  const data = useCardsState((state) => state.accountsPrivate);
  const prepaidCards = useCardsState((state) => state.prepaidCards);
  useEffect(() => {
    tk.wallet.cards.fetchAccountsPrivate();
  }, []);

  return useMemo(
    () => ({ isLoading, data, prepaidCards }),
    [isLoading, data, prepaidCards],
  );
}
