import { useExternalState } from './useExternalState';
import { tk } from '../tonkeeper';

export function useTonPrice() {
  return useExternalState(tk.wallet.prices.state, (state) => state.prices['TON']);
}
