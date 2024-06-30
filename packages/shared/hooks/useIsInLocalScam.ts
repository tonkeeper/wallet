import { ExternalStateSelector, useExternalState } from './useExternalState';
import { State } from '@tonkeeper/core';
import { useRef } from 'react';
import { useWallet } from './useWallet';
import { LocalScamManager } from '@tonkeeper/mobile/src/wallet/managers/LocalScamManager';

export function useIsInLocalScam(eventId: string): boolean | undefined {
  const wallet = useWallet();

  const initialState = useRef(new State(LocalScamManager.INITIAL_STATE)).current;

  const isOnLocalScamSelector: ExternalStateSelector<LocalScamManager, boolean> = (
    state,
  ) => state[eventId];

  return useExternalState(wallet?.localScam.state ?? initialState, isOnLocalScamSelector);
}
