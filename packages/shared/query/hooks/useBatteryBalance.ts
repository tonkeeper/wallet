import { tk } from '@tonkeeper/mobile/src/wallet';
import { useExternalState } from '../../hooks/useExternalState';
import { useWallet } from '../../hooks';

export const useBatteryBalance = () => {
  const wallet = useWallet();
  const state = useExternalState(wallet.battery.state);

  return {
    reload: () => tk.wallet?.battery.fetchBalance(),
    isLoading: state.isLoading,
    balance: state.balance,
  };
};
