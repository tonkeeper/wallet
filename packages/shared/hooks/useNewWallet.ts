import { ExternalStateSelector, useExternalState } from './useExternalState';
import { WalletState } from '@tonkeeper/core/src/Wallet';
import { tk } from '../tonkeeper';

export function useNewWallet(selector?: ExternalStateSelector<WalletState, WalletState>) {
  return useExternalState(tk.wallet?.state ?? { getSnapshot: () => {} }, selector);
}
