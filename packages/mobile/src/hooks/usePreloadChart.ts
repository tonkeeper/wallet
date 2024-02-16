import { useChartStore } from '$store/zustand/chart';
import { loadChartData } from '$shared/components/Chart/new/Chart.api';
import { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { useWalletCurrency } from '@tonkeeper/shared/hooks';

export function usePreloadChart() {
  const fiatCurrency = useWalletCurrency();
  const selectedPeriod = useChartStore(
    (state) => state.selectedPeriod,
    () => true,
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchQuery(['chartFetch', 'ton', fiatCurrency, selectedPeriod], () =>
      loadChartData(selectedPeriod, 'ton', fiatCurrency),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
