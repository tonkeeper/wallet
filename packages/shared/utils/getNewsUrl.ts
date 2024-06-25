import { config } from '@tonkeeper/mobile/src/config';
import { detectLocale } from '../i18n/translations';

// TODO: it's better to get news url from backend
export function getNewsUrl() {
  const deviceLocale = detectLocale(['ru', 'en', 'fa'], 'en');
  switch (deviceLocale) {
    case 'ru':
      return config.get('telegram_ru');
    case 'fa':
      return config.get('telegram_farsi');
    default:
      return config.get('telegram_global');
  }
}
