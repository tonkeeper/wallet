import { config } from '$config';

export const loadChartData = (period) =>
  fetch(`${config.get('tonkeeperEndpoint')}/stock/chart-new?period=${period}`).then(
    (res) => res.json(),
  );
