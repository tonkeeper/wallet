import { WalletAddress } from '@tonkeeper/core/src/Wallet';
import { tk } from '@tonkeeper/shared/tonkeeper';

export const useWallet = (): { address: WalletAddress } => {
  if (tk.wallet?.address) {
    return {
      address: tk.wallet.address,
    };
  }

  return {
    address: {
      tron: '',
      ton: {
        friendly: '',
        short: '',
        raw: '',
      },
    },
  };
};
