import { useState, useCallback, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const useAppState = (): AppStateStatus => {
  const [appState, setAppState] = useState(AppState.currentState);

  const handleChangeAppState = useCallback((newAppState: AppStateStatus) => {
    setAppState(newAppState);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleChangeAppState);
    return () => subscription.remove();
  });

  return appState;
};
