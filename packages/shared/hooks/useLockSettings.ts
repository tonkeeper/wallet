import { tk } from '@tonkeeper/mobile/src/wallet';
import { useExternalState } from './useExternalState';

export const useLockSettings = () => {
  const lockScreenEnabled = useExternalState(
    tk.walletsStore,
    (state) => state.lockScreenEnabled,
  );

  return {
    lockScreenEnabled,
    toggleLock: () => (tk.lockScreenEnabled ? tk.disableLock() : tk.enableLock()),
  };
};
