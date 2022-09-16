import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'

type AttachScreenContextValue = {
  attach: (pathname: string | null) => void;
  pathname: string | null;
};

const AttachScreenContext = React.createContext<AttachScreenContextValue | null>(null);

let _pathname: string | null = null;

const KEY = 'AttachScreenPathname';

export const AttachScreenProvider: React.FC = ({ children }) => {
  const [pathname, setPathname] = React.useState<string | null>(_pathname);

  const attach = React.useCallback(async (pathname: string | null) => {
    setPathname(pathname);
    _pathname = pathname

    if (pathname) {
      await AsyncStorage.setItem(KEY, pathname);
    } else {
      await AsyncStorage.removeItem(KEY);
    }
  }, []);

  const value = { attach, pathname };

  return (
    <AttachScreenContext.Provider value={value}>
      {children}
    </AttachScreenContext.Provider>
  )
};

export const useAttachScreen = () => {
  const ctx = React.useContext(AttachScreenContext);

  const attach = React.useCallback((pathname: string | null) => {
    if (ctx) {
      ctx.attach(pathname);
    }
  }, [])

  return { attach, pathname: ctx ? (ctx.pathname as any) : null };
}

export const getAttachScreenFromStorage = async (): Promise<string | null> => {
  if (_pathname) {
    return _pathname;
  }

  _pathname = await AsyncStorage.getItem(KEY);
  return _pathname;
};