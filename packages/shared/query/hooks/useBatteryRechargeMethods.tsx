import { useExternalState } from '../../hooks/useExternalState';
import { useWallet } from '../../hooks';
import { BatteryState } from '@tonkeeper/mobile/src/wallet/managers/BatteryManager';

export const useBatteryRechargeMethods = () => {
  const wallet = useWallet();
  const state = useExternalState(wallet.battery.state) as BatteryState;

  return {
    reload: () => wallet?.battery.fetchRechargeMethods(),
    isLoading: state.isRechargeMethodsLoading,
    methods: state.rechargeMethods,
  };
};
