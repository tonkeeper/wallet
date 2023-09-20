import { ExternalStateSelector, useExternalState } from './useExternalState';
import { WalletState } from '@tonkeeper/core';
import { tk } from '../tonkeeper';

export function useWallet<T = WalletState>(
  selector?: ExternalStateSelector<WalletState, T>,
): T | null {
  return useExternalState(tk.wallet?.state ?? { getSnapshot: () => null }, selector);
}
