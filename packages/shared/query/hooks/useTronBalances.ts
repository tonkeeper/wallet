import { useQuery } from 'react-query';
import { tk } from '../../tonkeeper';

export const useTronBalances = () => {
  return useQuery({
    enabled: !!tk.wallet?.address.tron,
    queryKey: ['tron_balances', tk.wallet?.balances.tronCacheKey],
    cacheTime: Infinity,
    queryFn: async () => {
      return tk.wallet?.balances.fetchTron();
    },
  });
};
