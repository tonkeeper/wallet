import { tk } from '@tonkeeper/mobile/src/wallet';
import { useExternalState } from '../../hooks/useExternalState';
import { batteryState } from '@tonkeeper/mobile/src/wallet/managers/BatteryManager';

export const useBatteryBalance = () => {
  const state = useExternalState(batteryState);

  return {
    reload: () => tk.wallet?.battery.fetchBalance(),
    isLoading: state.isLoading,
    balance: state.balance,
  };
};
