import { useExternalState } from './useExternalState';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { useJettons } from './useJettons';
import { TokenRate } from '@tonkeeper/mobile/src/wallet/WalletTypes';

export function useRates(): Record<string, TokenRate> {
  const ton = useExternalState(tk.tonPrice.state, (s) => s.ton);
  const jettonsRates = useJettons((s) => s.jettonRates);

  return { ton, ...jettonsRates };
}
