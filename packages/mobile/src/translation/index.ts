// Deprecated

import { createContext } from 'react';
import { i18n } from '@tonkeeper/shared/i18n';

export const TranslatorContext = createContext((scope: string, options?: any) =>
  i18n.t(scope, options),
);

export * from '@tonkeeper/shared/i18n';
