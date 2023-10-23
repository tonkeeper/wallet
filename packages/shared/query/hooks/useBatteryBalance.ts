import { tk } from '../../tonkeeper';
import { useQuery } from 'react-query';

export const useBatteryBalance = () => {
  return useQuery({
    enabled: !!tk.wallet?.address.ton,
    queryKey: tk.wallet?.battery.cacheKey,
    cacheTime: Infinity,
    queryFn: async () => {
      return tk.wallet?.battery.getBalance();
    },
  });
};
