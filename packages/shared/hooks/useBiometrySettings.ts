import { tk } from '@tonkeeper/mobile/src/wallet';
import { useExternalState } from './useExternalState';

export const useBiometrySettings = () => {
  const biometryEnabled = useExternalState(
    tk.walletsStore,
    (state) => state.biometryEnabled,
  );

  const { enableBiometry, disableBiometry } = tk;

  return { biometryEnabled, enableBiometry, disableBiometry };
};
