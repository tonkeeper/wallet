import { Scope, TranslateOptions } from 'i18n-js';
import memoizeOne from 'memoize-one';
import { i18n } from './i18n';

export type TranslatorFunc = (scope: Scope, options?: TranslateOptions) => string;

export const t = memoizeOne<TranslatorFunc>((scope, options?) => {
  return i18n.t(scope, options)
});
