import { AddressFormats } from '@tonkeeper/core';
import { tk } from '@tonkeeper/shared/tonkeeper';

export const useWallet = (): { address: AddressFormats } => {
  if (tk.wallet?.address) {
    return {
      address: tk.wallet.address,
    };
  }

  return {
    address: {
      friendly: '',
      short: '',
      raw: '',
    },
  };
};
