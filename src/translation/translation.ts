import memoizeOne from 'memoize-one';
import { createContext } from 'react';
import { Scope, TranslateOptions } from 'i18n-js';
import { i18n } from './i18n';

// Deprecated
export const TranslatorContext = createContext(
  (scope: Scope, options?: TranslateOptions) => i18n.t(scope, options),
);

export type TranslatorFunc = (scope: Scope, options?: TranslateOptions) => string;

export const t = memoizeOne<TranslatorFunc>((scope, options?) => {
  return i18n.t(scope, options)
});
