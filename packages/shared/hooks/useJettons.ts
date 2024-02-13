import { ExternalStateSelector, useExternalState } from './useExternalState';
import { State } from '@tonkeeper/core';
import { useRef } from 'react';
import { useWallet } from './useWallet';
import {
  JettonsState,
  JettonsManager,
} from '@tonkeeper/mobile/src/wallet/managers/JettonsManager';

export function useJettons<T = JettonsState>(
  selector?: ExternalStateSelector<JettonsState, T>,
): T {
  const wallet = useWallet();

  const initialState = useRef(new State(JettonsManager.INITIAL_STATE)).current;

  return useExternalState(wallet?.jettons.state ?? initialState, selector);
}
