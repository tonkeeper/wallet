import { useInfiniteQuery } from '../../hooks/useInfiniteQuery';
import { tk } from '../../tonkeeper';

export const useTronTransactions = () => {
  return useInfiniteQuery({
    queryKey: ['tron'],
    queryFn: (cursor) => tk.wallet.transactions.fetchTronTransactions(cursor),
    dataExtractor: (data) => data.items,
    getCursor: (data) => data.cursor,
  });
};
