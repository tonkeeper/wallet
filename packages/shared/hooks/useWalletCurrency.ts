import { useExternalState } from './useExternalState';
import { tk } from '@tonkeeper/mobile/src/wallet';

export function useWalletCurrency() {
  return useExternalState(tk.tonPrice.state, (s) => s.currency);
}
