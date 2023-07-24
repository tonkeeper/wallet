import list from './list.json';
import { i18n } from '$translation';

export function getCountries() {
  return list.country.map((country, idx, arr) => {
    return {
      code: country.alpha2,
      name: i18n.locale === 'ru' ? country.ru : country.en,
      isFirst: idx === 0,
      isLast: idx === arr.length - 1,
    };
  });
}
