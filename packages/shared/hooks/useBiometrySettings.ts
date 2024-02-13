import { tk } from '@tonkeeper/mobile/src/wallet';
import { useExternalState } from './useExternalState';

export const useBiometrySettings = () => {
  const biometryEnabled = useExternalState(
    tk.walletsStore,
    (state) => state.biometryEnabled,
  );

  return {
    biometryEnabled,
    enableBiometry: (passcode: string) => tk.enableBiometry(passcode),
    disableBiometry: () => tk.disableBiometry(),
  };
};
