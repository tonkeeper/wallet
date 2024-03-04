import { tk } from '@tonkeeper/mobile/src/wallet';
import { useExternalState } from './useExternalState';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useUnlockVault } from '@tonkeeper/mobile/src/core/ModalContainer/NFTOperations/useUnlockVault';
import { getLastEnteredPasscode } from '@tonkeeper/mobile/src/store/wallet/sagas';

export const useBiometrySettings = () => {
  const biometryEnabled = useExternalState(
    tk.walletsStore,
    (state) => state.biometryEnabled,
  );

  const unlockVault = useUnlockVault();

  const prevAppState = useRef(AppState.currentState);
  const isProcessing = useRef(false);

  const [isAvailable, setIsAvailable] = useState(tk.biometry.isAvailable);
  const [isEnabledSwitch, setIsEnabledSwitch] = useState(biometryEnabled);

  useEffect(() => {
    const listener = AppState.addEventListener('change', (nextAppState) => {
      if (prevAppState.current === 'background' && nextAppState === 'active') {
        tk.biometry.detectTypes().then((biometry) => {
          setIsAvailable(biometry.isAvailable);
        });
      }
      prevAppState.current = nextAppState;
    });

    return () => {
      listener.remove();
    };
  }, []);

  useEffect(() => {
    setIsEnabledSwitch(biometryEnabled);
  }, [biometryEnabled]);

  const enableBiometry = useCallback(
    (passcode: string) => tk.enableBiometry(passcode),
    [],
  );

  const disableBiometry = useCallback(() => tk.disableBiometry(), []);

  const toggleBiometry = useCallback(async () => {
    if (isProcessing.current) {
      return;
    }

    isProcessing.current = true;

    try {
      setIsEnabledSwitch(!biometryEnabled);
      if (biometryEnabled) {
        await disableBiometry();
      } else {
        await unlockVault();
        const passcode = getLastEnteredPasscode();
        await enableBiometry(passcode);
      }
    } catch {
      setIsEnabledSwitch(biometryEnabled);
    } finally {
      isProcessing.current = false;
    }
  }, [biometryEnabled, unlockVault]);

  return {
    isAvailable,
    isEnabled: biometryEnabled,
    isEnabledSwitch,
    type: tk.biometry.type,
    enableBiometry,
    disableBiometry,
    toggleBiometry,
  };
};
