import { ExternalStateSelector, useExternalState } from './useExternalState';
import { TonkeeperState } from '@tonkeeper/core';
import { tk } from '../tonkeeper';

export function useTonkeeper(
  selector?: ExternalStateSelector<TonkeeperState, TonkeeperState>,
) {
  return useExternalState(tk.state, selector);
}
