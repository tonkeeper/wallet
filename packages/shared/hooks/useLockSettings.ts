import { tk } from '@tonkeeper/mobile/src/wallet';
import { useExternalState } from './useExternalState';

export const useLockSettings = () => {
  const lockEnabled = useExternalState(tk.walletsStore, (state) => state.lockEnabled);

  return {
    lockEnabled,
    toggleLock: () => (tk.lockEnabled ? tk.disableLock() : tk.enableLock()),
  };
};
