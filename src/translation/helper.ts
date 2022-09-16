import i18n from 'i18n-js';
import memoizeOne from 'memoize-one';

import { TranslatorFunc } from './TranslatorContext';

const unmemoizedT: TranslatorFunc = (scope, options?) => i18n.t(scope, options);
export const t = memoizeOne(unmemoizedT);

export function pluralizeForRussian(count: number): string[] {
  const key =
    count % 10 === 1 && count % 100 !== 11
      ? 'one'
      : [2, 3, 4].indexOf(count % 10) >= 0 && [12, 13, 14].indexOf(count % 100) < 0
      ? 'few'
      : count % 10 === 0 ||
        [5, 6, 7, 8, 9].indexOf(count % 10) >= 0 ||
        [11, 12, 13, 14].indexOf(count % 100) >= 0
      ? 'many'
      : 'other';

  return [key];
}
