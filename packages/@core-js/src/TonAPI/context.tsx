import { createContext, useContext, memo } from 'react';
import { TonAPI } from './TonAPI';

const TonAPIContext = createContext<TonAPI | null>(null);

interface TonAPIProviderProps {
  children: React.ReactNode;
  tonapi: TonAPI;
}

export const TonAPIProvider = memo(({ children, tonapi }: TonAPIProviderProps) => (
  <TonAPIContext.Provider value={tonapi}>{children}</TonAPIContext.Provider>
));

export const useTonAPI = () => {
  const tonapi = useContext(TonAPIContext);

  if (tonapi === null) {
    throw new Error('Wrap App TonAPIProvider');
  }

  return tonapi;
};
