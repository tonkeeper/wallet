import { useExternalState } from '../../hooks/useExternalState';
import { cardsState } from '@tonkeeper/core/src/managers/CardsManager';

export const useCardsState = () => {
  return useExternalState(cardsState);
};
