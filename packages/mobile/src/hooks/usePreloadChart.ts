import { useChartStore } from '$store/zustand/chart';
import { loadChartData } from '$shared/components/Chart/new/Chart.api';
import { useEffect } from 'react';
import { useQueryClient } from 'react-query';

export function usePreloadChart() {
  const selectedPeriod = useChartStore(
    (state) => state.selectedPeriod,
    () => true,
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchQuery(['chartFetch', selectedPeriod], () =>
      loadChartData(selectedPeriod),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
