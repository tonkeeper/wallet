import { ExternalStateSelector, useExternalState } from './useExternalState';
import { DependencyList, useRef } from 'react';
import { State } from '@tonkeeper/core';
import { useWallet } from './useWallet';
import {
  BalancesState,
  BalancesManager,
} from '@tonkeeper/mobile/src/wallet/managers/BalancesManager';

export function useBalancesState<T = BalancesState>(
  selector?: ExternalStateSelector<BalancesState, T>,
  deps?: DependencyList,
): T {
  const wallet = useWallet();

  const initialState = useRef(new State(BalancesManager.INITIAL_STATE)).current;

  return useExternalState(wallet?.balances.state ?? initialState, selector, deps);
}
