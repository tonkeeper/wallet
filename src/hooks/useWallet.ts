import { walletWalletSelector } from '$store/wallet';
import { Wallet } from 'blockchain';
import { useSelector } from 'react-redux';

export const useWallet = (): Wallet => {
  const wallet = useSelector(walletWalletSelector);

  if (!wallet) {
    throw new Error('No Wallet');
  }

  return wallet;
};
