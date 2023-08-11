import { tk } from '../../tonkeeper';

export const useSubscription = (address?: string) => {
  if (address) {
    return tk.wallet.subscriptions.getCachedByAddress(address);
  }

  return null;
};
