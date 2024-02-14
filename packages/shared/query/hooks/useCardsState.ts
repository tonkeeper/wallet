import { useExternalState } from '../../hooks/useExternalState';
import { useWallet } from '../../hooks';
import { useRef } from 'react';
import { State } from '@tonkeeper/core';
import { CardsManager } from '@tonkeeper/mobile/src/wallet/managers/CardsManager';

export const useCardsState = () => {
  const wallet = useWallet();

  const initialState = useRef(new State(CardsManager.INITIAL_STATE)).current;

  return useExternalState(wallet?.cards.state ?? initialState);
};
