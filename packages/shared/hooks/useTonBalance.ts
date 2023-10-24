import { WalletContractVersion } from '@tonkeeper/core';
import { useExternalState } from './useExternalState';
import { useNewWallet } from './useWallet';
import { tk } from '../tonkeeper';

export function useTonBalance(version?: WalletContractVersion) {
  const currentVersion = useNewWallet((state) => state.ton.address.version);
  return useExternalState(tk.wallet.tonBalance.state, (state) => {
    return version ? state[version] : state[currentVersion];
  });
}
