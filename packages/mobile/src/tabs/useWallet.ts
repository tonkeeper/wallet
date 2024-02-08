import { WalletAddress } from '$wallet/WalletTypes';
import { tk } from '$wallet';

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
