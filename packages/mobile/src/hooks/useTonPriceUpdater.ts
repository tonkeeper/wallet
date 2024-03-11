import { useEffect, useRef } from 'react';
import { useAppState } from './useAppState';
import { tk } from '$wallet';

export const useTonPriceUpdater = () => {
  const appState = useAppState();
  const prevAppState = useRef(appState);

  useEffect(() => {
    if (
      prevAppState.current === 'background' &&
      appState === 'active' &&
      tk.tonPrice.state.data.updatedAt < Date.now() - 1000 * 30
    ) {
      tk.tonPrice.load();
    }

    prevAppState.current = appState;

    if (appState === 'active') {
      const interval = setInterval(() => {
        tk.tonPrice.load();
      }, 1000 * 30);
      return () => clearInterval(interval);
    }
  }, [appState]);
};
