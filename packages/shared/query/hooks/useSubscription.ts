import { tk } from '@tonkeeper/mobile/src/wallet';

export const useSubscription = (address?: string) => {
  if (address) {
    return tk.wallet.subscriptions.getCachedByAddress(address);
  }

  return null;
};
