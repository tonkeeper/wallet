import { ExternalStateSelector, useExternalState } from './useExternalState';
import { WalletState } from '@tonkeeper/core';
import { tk } from '../tonkeeper';

export function useNewWallet<T = WalletState>(
  selector?: ExternalStateSelector<WalletState, T>,
): T {
  return useExternalState(tk.wallet?.state ?? { getSnapshot: () => null }, selector);
}
