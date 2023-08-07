import { createContext, useState, useContext } from 'react';

const initial = {
  identity: '333',
  name: 'Main',
};

const WalletContext = createContext<{
  wallet: typeof initial;
  setWallet: (wallet: typeof initial) => void;
}>({
  wallet: initial,
  setWallet: () => {},
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [wallet, setWallet] = useState(initial);

  return (
    <WalletContext.Provider value={{ wallet, setWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const { wallet } = useContext(WalletContext);

  return wallet;
};

export const useSwitchWallet = () => {
  const { setWallet } = useContext(WalletContext);

  return (wallet: any) => {
    setWallet(wallet);
  };
};
