import { walletWalletSelector } from '$store/wallet';
import { Address, AddressFormats } from '@tonkeeper/core';
import { useSelector } from 'react-redux';

export const useWallet = (): { address: AddressFormats } => {
  const wallet = useSelector(walletWalletSelector);

  if (wallet && wallet.address) {
    return {
      address: {
        short: Address.toShort(wallet.address.friendlyAddress),
        friendly: wallet.address.friendlyAddress,
        raw: wallet.address.rawAddress,
      },
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
