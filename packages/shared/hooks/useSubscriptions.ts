import { ExternalStateSelector, useExternalState } from './useExternalState';
import { State } from '@tonkeeper/core';
import { useRef } from 'react';
import { useWallet } from './useWallet';
import {
  SubscriptionsState,
  SubscriptionsManager,
} from '@tonkeeper/mobile/src/wallet/managers/SubscriptionsManager';

export function useSubscriptions<T = SubscriptionsState>(
  selector?: ExternalStateSelector<SubscriptionsState, T>,
): T {
  const wallet = useWallet();

  const initialState = useRef(new State(SubscriptionsManager.INITIAL_STATE)).current;

  return useExternalState(wallet?.subscriptions.state ?? initialState, selector);
}
