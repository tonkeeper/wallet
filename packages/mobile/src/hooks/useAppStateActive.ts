import { useRef, useEffect } from 'react';

import { useAppState } from '$hooks/useAppState';

export function useAppStateActive(handler: () => void) {
  const appState = useAppState();
  const prevAppState = useRef(appState);

  useEffect(() => {
    if (appState === 'active' && prevAppState.current !== 'active') {
      handler();
    }
    prevAppState.current = appState;
  }, [appState, handler]);
}
