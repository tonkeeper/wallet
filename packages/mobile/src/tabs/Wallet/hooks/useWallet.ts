import { walletWalletSelector } from '$store/wallet';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

export const useWallet = () => {
  const wallet = useSelector(walletWalletSelector);

  return useMemo(() => {
    if (wallet && wallet.address) {
      return { address: wallet.address };
    }
    return null;
  }, [wallet]);
};
