import { useEffect, useState } from 'react';
import { tk } from '@tonkeeper/mobile/src/wallet';

export const useWallets = () => {
  const [wallets, setWallet] = useState(Array.from(tk.wallets.values()));

  useEffect(() => {
    const unsubscribe = tk.onChangeWallet(() => {
      setWallet(Array.from(tk.wallets.values()));
    });

    return unsubscribe;
  }, []);

  return wallets;
};
