import { useContext } from 'react';
import { WalletContext } from '@tonkeeper/mobile/src/context';

export const useWallet = () => {
  return useContext(WalletContext).wallet;
};
