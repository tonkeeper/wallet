import { enUS, ru, tr, zhCN } from 'date-fns/locale';
import { i18n, t } from '../i18n';
import {
  differenceInCalendarMonths,
  format as dateFnsFormat,
  startOfToday,
  startOfYesterday,
  differenceInCalendarYears,
} from 'date-fns';

const dateFnsLocales = { ru, en: enUS, tr, 'zh-Hans': zhCN };

const getFNSLocale = () => {
  return dateFnsLocales[i18n.locale] ?? enUS;
};

export function formatDate(date: number | Date, formatString: string, options?: any) {
  return dateFnsFormat(date, formatString, {
    locale: getFNSLocale(),
    ...options,
  });
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const isToday = (date: Date) => {
  return formatDate(date, 'dd MM yyyy') === formatDate(startOfToday(), 'dd MM yyyy');
};
export const isYesterday = (date: Date) => {
  return formatDate(date, 'dd MM yyyy') === formatDate(startOfYesterday(), 'dd MM yyyy');
};
export const isThisYear = (date: Date) => {
  return differenceInCalendarYears(new Date(), date) < 1;
};
export const isThisMonth = (date: Date) => {
  return differenceInCalendarMonths(new Date(), date) < 1;
};

export function getDateForGroupTansactions(
  timestamp: number,
  skipNormalizeTimestemp?: boolean,
) {
  const ts = new Date(timestamp * (skipNormalizeTimestemp ? 1 : 1000));
  const now = new Date();

  if (differenceInCalendarMonths(now, ts) < 1) {
    return formatDate(ts, 'd MMMM');
  }

  return formatDate(ts, 'LLLL yyyy');
}

export function formatTransactionsGroupDate(timestamp: number) {
  const date = new Date(timestamp);
  if (isToday(date)) {
    return t('today');
  } else if (isYesterday(date)) {
    return t('yesterday');
  } else {
    if (isThisMonth(date)) {
      return formatDate(date, 'd MMMM');
    } else if (isThisYear(date)) {
      return capitalizeFirstLetter(formatDate(date, 'LLLL'));
    } else {
      return capitalizeFirstLetter(formatDate(date, 'LLLL yyyy'));
    }
  }
}

export function formatTransactionTime(date: Date) {
  const shortMonth = formatDate(date, 'MMM').replace('.', '') + ',';
  const month = i18n.locale === 'en' ? capitalizeFirstLetter(shortMonth) : shortMonth;
  const time = formatDate(date, 'HH:mm');
  const day = formatDate(date, 'd');

  if (isThisMonth(date)) {
    return time;
  }

  return `${day} ${month} ${time}`;
}

export function formatTransactionDetailsTime(date: Date) {
  const shortMonth = formatDate(date, 'MMM').replace('.', '') + ',';
  const month = i18n.locale === 'en' ? capitalizeFirstLetter(shortMonth) : shortMonth;
  const time = formatDate(date, 'HH:mm');
  const day = formatDate(date, 'd');
  const year = formatDate(date, 'yyyy');

  if (isThisYear(date)) {
    return `${day} ${month} ${time}`;
  }

  return `${day} ${month} ${year}, ${time}`;
}

export function timestampToDateString(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are 0-based, so we add 1
  const day = date.getUTCDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function dateToTimestamp(dateString: string): number {
  const date = new Date(dateString);
  return Math.floor(date.getTime() / 1000);
}
