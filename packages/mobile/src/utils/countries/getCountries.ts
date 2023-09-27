import list from './list.json';
import { i18n } from '$translation';

export function getCountries() {
  return list.country
    .map((country) => {
      return {
        code: country.alpha2,
        name: i18n.locale === 'ru' ? country.ru : country.en,
      };
    })
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      return 1;
    });
}
