import { useRef } from 'react';
import { State } from '@tonkeeper/core';
import { useWallet } from '@tonkeeper/shared/hooks';
import { useExternalState } from '@tonkeeper/shared/hooks/useExternalState';
import { CardsManager, CardsState } from '$wallet/managers/CardsManager';

export const useCardsState = () => {
  const wallet = useWallet();

  const initialState = useRef(new State(CardsManager.INITIAL_STATE)).current;

  return useExternalState<CardsState>(wallet?.cards.state ?? initialState);
};
