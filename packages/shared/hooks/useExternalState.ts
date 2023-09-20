import { useCallback, useRef, useSyncExternalStore } from 'react';
import { DefaultStateData, State } from '@tonkeeper/core';

type ExternalStateSelector<TStateData, TSelectedData> = (
  state: TStateData,
) => TSelectedData;

const defaultStateSelector = (state) => state;

export function useExternalState<
  TStateData extends DefaultStateData,
  TSelected = TStateData,
>(
  state: State<TStateData>,
  selector: ExternalStateSelector<TStateData, TSelected> = defaultStateSelector,
): TSelected {
  let currentData = useRef(selector(state.getSnapshot()));

  const getSnapshot = () => selector(state.getSnapshot());

  return useSyncExternalStore(
    useCallback((cb) => {
      return state.subscribe((data) => {
        const nextState = selector(data);
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
