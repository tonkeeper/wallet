import { enUS, ru } from 'date-fns/locale';
import { i18n, t } from '../i18n';
import {
  differenceInCalendarMonths,
  differenceInYears,
  format as dateFnsFormat,
  startOfToday,
  startOfYesterday,
} from 'date-fns';

const dateFnsLocales = { ru, en: enUS };

const getFNSLocale = () => {
  return dateFnsLocales[i18n.locale] ?? enUS;
}

export function formatDate(date: number | Date, formatString: string, options?: any) {
  return dateFnsFormat(date, formatString, {
    locale: getFNSLocale(),
    ...options,
  });
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function formatTransactionsPeriodDate(date: Date) {
  const now = new Date();
  const dateString = formatDate(date, 'dd MM yyyy');

  if (dateString === formatDate(startOfToday(), 'dd MM yyyy')) {
    return t('today');
  } else if (dateString === formatDate(startOfYesterday(), 'dd MM yyyy')) {
    return t('yesterday');
  } else {
    if (differenceInCalendarMonths(now, date) < 1) {
      return formatDate(date, 'd MMMM', {
        locale: getFNSLocale(),
      });
    } else if (differenceInYears(now, date) < 1) {
      return capitalizeFirstLetter(
        formatDate(date, 'LLLL', {
          locale: getFNSLocale(),
        }),
      );
    } else {
      return capitalizeFirstLetter(
        formatDate(date, 'LLLL yyyy', {
          locale: getFNSLocale(),
        }),
      );
    }
  }
}
