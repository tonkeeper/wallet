import { DependencyList, useRef } from 'react';
import { State } from '@tonkeeper/core';
import { useWallet } from '@tonkeeper/shared/hooks';
import {
  ExternalStateSelector,
  useExternalState,
} from '@tonkeeper/shared/hooks/useExternalState';
import { CardsManager, CardsState } from '$wallet/managers/CardsManager';

export function useCardsState<T = CardsState>(
  selector?: ExternalStateSelector<CardsState, T>,
  deps?: DependencyList,
): T {
  const wallet = useWallet();

  const initialState = useRef(new State(CardsManager.INITIAL_STATE)).current;

  return useExternalState(wallet?.cards.state ?? initialState, selector, deps);
}
