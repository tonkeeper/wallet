import { ChartPeriod } from '$store/zustand/chart';
import { tk } from '$wallet';

const ONE_HOUR = 60 * 60;
const ONE_DAY = 24 * ONE_HOUR;

function getPeriodFromTimestamp(period) {
  const dateNowSec = Math.round(Date.now() / 1000);
  switch (period) {
    case ChartPeriod.ONE_HOUR:
      return dateNowSec - ONE_HOUR;
    case ChartPeriod.ONE_DAY:
      return dateNowSec - ONE_DAY;
    case ChartPeriod.SEVEN_DAYS:
      return dateNowSec - ONE_DAY * 7;
    case ChartPeriod.ONE_MONTH:
      return dateNowSec - ONE_DAY * 31;
    case ChartPeriod.SIX_MONTHS:
      return dateNowSec - ONE_DAY * 183;
    case ChartPeriod.ONE_YEAR:
      return dateNowSec - ONE_DAY * 366;
  }
}

export function loadChartData(period: ChartPeriod, token: string, currency: string) {
  return tk.wallet.tonapi.rates.getChartRates({
    token,
    currency,
    end_date: Math.round(Date.now() / 1000),
    start_date: getPeriodFromTimestamp(period),
  });
}
