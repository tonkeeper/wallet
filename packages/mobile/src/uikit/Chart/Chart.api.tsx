import { getServerConfig } from "$shared/constants";

export const loadChartData = (period) => fetch(`${getServerConfig('tonkeeperEndpoint')}/stock/chart-new?period=${period}`).then(res =>
    res.json()
);