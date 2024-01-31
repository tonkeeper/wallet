import { tk } from '../../tonkeeper';
import { useExternalState } from '../../hooks/useExternalState';
import { batteryState } from '@tonkeeper/core/src/managers/BatteryManager';

export const useBatteryBalance = () => {
  const state = useExternalState(batteryState);

  return {
    reload: () => tk.wallet?.battery.fetchBalance(),
    isLoading: state.isLoading,
    balance: state.balance,
  };
};
