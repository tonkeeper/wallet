import { useCallback, useRef, useSyncExternalStore } from 'react';
import { DefaultStateData, State } from '@tonkeeper/core';

export function useExternalState<TData extends DefaultStateData>(state: State<TData>) {
  let currentData = useRef(state.getSnapshot());

  const getSnapshot = () => state.getSnapshot();

  return useSyncExternalStore(
    useCallback((cb) => {
      return state.subscribe((data) => {
        const nextState = data;
        if (currentData.current !== nextState) {
          currentData.current = nextState;
          cb();
        }
      });
    }, []),
    getSnapshot,
    getSnapshot,
  );
}
