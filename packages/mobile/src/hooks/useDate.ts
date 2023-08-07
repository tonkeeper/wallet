import {
  differenceInHours,
  differenceInYears,
  format,
  formatDistanceToNow,
} from 'date-fns';
import { getLocale } from '$utils';
import { t } from '@tonkeeper/shared/i18n';

export function useDate(ts: number): string {

  const date = new Date(ts * 1000);
  let dateStr: string;
  if (differenceInHours(new Date(), date) < 24) {
    dateStr = formatDistanceToNow(date, {
      locale: getLocale(),
      addSuffix: true,
    });
  } else if (differenceInYears(new Date(), date) === 0) {
    dateStr = `${format(date, 'dd MMM', { locale: getLocale() })} ${t(
      'time_in',
    )} ${format(date, 'HH:mm', {
      locale: getLocale(),
    })}`;
  } else {
    dateStr = `${format(date, 'dd MMM yyyy', { locale: getLocale() })} ${t(
      'time_in',
    )} ${format(date, 'HH:mm', {
      locale: getLocale(),
    })}`;
  }

  return dateStr;
}
