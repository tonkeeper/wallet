import { ExternalStateSelector, useExternalState } from './useExternalState';
import { DependencyList, useRef } from 'react';
import { State } from '@tonkeeper/core';
import { useWallet } from './useWallet';
import {
  NftsState,
  NftsManager,
} from '@tonkeeper/mobile/src/wallet/managers/NftsManager';

export function useNftsState<T = NftsState>(
  selector?: ExternalStateSelector<NftsState, T>,
  deps?: DependencyList,
): T {
  const wallet = useWallet();

  const initialState = useRef(new State(NftsManager.INITIAL_STATE)).current;

  return useExternalState(wallet?.nfts.state ?? initialState, selector, deps);
}
