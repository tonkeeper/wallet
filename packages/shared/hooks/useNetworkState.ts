import { tk } from '../tonkeeper';
import { useExternalState } from './useExternalState';

export function useNetworkState() {
  return useExternalState(tk.wallet.network.state);
}
