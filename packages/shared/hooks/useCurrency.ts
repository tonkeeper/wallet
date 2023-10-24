import { useNewWallet } from './useWallet';

export function useCurrency() {
  return useNewWallet((state) => state.currency);
}
