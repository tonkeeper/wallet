import { BatterySupportedTransaction } from '@tonkeeper/mobile/src/wallet/managers/BatteryManager';
import { useExternalState } from './useExternalState';
import { tk } from '@tonkeeper/mobile/src/wallet';

export function useIsEnabledForBattery(transactionType: BatterySupportedTransaction) {
  const enabledTransactions = useExternalState(
    tk.wallet.battery.state,
    (state) => state.supportedTransactions,
  );

  return enabledTransactions[transactionType];
}
