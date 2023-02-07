import { useContext } from 'react';

import { TranslatorContext } from '$translation';

export const useTranslator = () => {
  return useContext(TranslatorContext);
};
