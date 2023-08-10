import { AccountEventsMapper } from '../../mappers/AccountEventsMapper';
import { useInfiniteQuery } from '../../hooks/useInfiniteQuery';
import { tk } from '../../tonkeeper';
import { useMemo } from 'react';

export const useWalletTransactions = () => {
  const query = useInfiniteQuery({
    queryFn: (next_from) => tk.wallet.transactions.fetch(next_from),
    initialData: tk.wallet.transactions.persisted,
    queryKey: tk.wallet.transactions.cacheKey,
    dataExtractor: (data) => data.events,
    getCursor: (data) => data.next_from,
  });

  // TODO: move to transactions manager
  const modifed = useMemo(() => {
    return AccountEventsMapper(query.data ?? [], tk.wallet.address.raw);
  }, [query.data, tk.wallet.address.raw]);

  return {
    ...query,
    data: modifed,
  };
};
