import { walletSelector } from '$store/wallet';
import { Wallet } from 'blockchain';
import { useSelector } from 'react-redux';

export const useWallet = (): Wallet => {
  const { wallet } = useSelector(walletSelector);

  if (!wallet) {
    throw new Error('No Wallet');
  }

  return wallet;
};
