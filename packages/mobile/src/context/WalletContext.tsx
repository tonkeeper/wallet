import React, { createContext, useEffect, useState } from 'react';
import { tk } from '$wallet';
import { Wallet } from '$wallet/Wallet';

export const WalletContext = createContext<{ wallet: Wallet }>({ wallet: tk.wallet });

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState({ wallet: tk.wallet });

  useEffect(() => {
    const unsubscribe = tk.onChangeWallet(() => {
      setState({ wallet: tk.wallet });
    });

    return unsubscribe;
  }, []);
  return <WalletContext.Provider value={state}>{children}</WalletContext.Provider>;
};
