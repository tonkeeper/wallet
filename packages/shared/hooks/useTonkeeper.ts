import { ExternalStateSelector, useExternalState } from './useExternalState';
import { TonkeeperState } from '@tonkeeper/core';
import { tk } from '../tonkeeper';

export function useTonkeeper<T = TonkeeperState>(
  selector?: ExternalStateSelector<TonkeeperState, T>,
): T | null {
  return useExternalState(tk.state, selector);
}