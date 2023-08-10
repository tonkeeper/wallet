import { tk } from '../../tonkeeper';

export const useSubscription = (address: string) => {
  return tk.wallet.subscriptions.getCachedByAddress(address);
};
