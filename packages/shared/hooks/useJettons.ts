import { ExternalStateSelector, useExternalState } from './useExternalState';
import { JettonsState } from '@tonkeeper/core/src/managers/JettonsManager';
import { tk } from '../tonkeeper';

export function useJettons<T = JettonsState>(
  selector?: ExternalStateSelector<JettonsState, T>,
): T {
  return useExternalState(tk.wallet.jettons.state, selector);
}
