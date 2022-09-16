import React from 'react';
import { DeepLinkingContext } from '../DeepLinkingContext';

export const useDeeplinking = () => {
  const deeplinking = React.useContext(DeepLinkingContext);

  if (!deeplinking) {
    throw new Error('No DeepLinkingProvider');
  }

  return deeplinking;
}