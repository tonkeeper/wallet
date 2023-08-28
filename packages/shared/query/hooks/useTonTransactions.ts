import { useInfiniteQuery } from '../../hooks/useInfiniteQuery';
import { tk } from '../../tonkeeper';

export const useTonTransactions = () => {
  return useInfiniteQuery({
    queryKey: tk.wallet.transactions.getTonCacheKey('ton-screen'),
    queryFn: (cursor) => tk.wallet.transactions.fetchTonTransactions(cursor),
    dataExtractor: (data) => data.items,
    getCursor: (data) => data.cursor,
  });
};
