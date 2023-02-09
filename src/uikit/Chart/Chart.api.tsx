import { getServerConfig } from "$shared/constants";
import { ChartPeriod } from "./Chart.types";

export const loadChartData = (period) => fetch(`${getServerConfig('tonkeeperEndpoint')}/stock/chart?period=${period}`).then(res =>
    res.json()
);