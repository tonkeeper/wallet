import { walletWalletSelector } from '$store/wallet';
import { AddressFormats } from '@tonkeeper/core';
import { useSelector } from 'react-redux';

export const useWallet = (): { address: AddressFormats } => {
  const wallet = useSelector(walletWalletSelector);

  if (wallet && wallet.address) {
    return {
      address: {
        friendly: wallet.address.friendlyAddress,
        raw: wallet.address.rawAddress,
      },
    };
  }

  return {
    address: {
      friendly: '',
      raw: '',
    },
  };
};
