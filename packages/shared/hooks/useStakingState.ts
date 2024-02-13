import { ExternalStateSelector, useExternalState } from './useExternalState';
import { DependencyList, useRef } from 'react';
import { State } from '@tonkeeper/core';
import { useWallet } from './useWallet';
import {
  StakingState,
  StakingManager,
} from '@tonkeeper/mobile/src/wallet/managers/StakingManager';

export function useStakingState<T = StakingState>(
  selector?: ExternalStateSelector<StakingState, T>,
  deps?: DependencyList,
): T {
  const wallet = useWallet();

  const initialState = useRef(new State(StakingManager.INITIAL_STATE)).current;

  return useExternalState(wallet?.staking.state ?? initialState, selector, deps);
}
