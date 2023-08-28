import { useInfiniteQuery } from '../../hooks/useInfiniteQuery';
import { tk } from '../../tonkeeper';

export const useAllTransactions = () => {
  return useInfiniteQuery({
    queryFn: (cursor) => tk.wallet?.transactions.fetchAllTransactions(cursor),
    queryKey: tk.wallet?.transactions.getTonCacheKey(),
    initialData: tk.wallet?.transactions.persisted,
    dataExtractor: (data) => data.items,
    getCursor: (data) => data.cursor,
  });
};
