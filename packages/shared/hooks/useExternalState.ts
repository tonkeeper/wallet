import {
  DependencyList,
  useCallback,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import { DefaultStateData, State } from '@tonkeeper/core';
import memoize from 'lodash/memoize';

export type ExternalStateSelector<TStateData, TSelectedData> = (
  state: TStateData,
) => TSelectedData;

const defaultStateSelector = (state) => state;

export function useExternalState<
  TStateData extends DefaultStateData,
  TSelected = TStateData,
>(
  state: State<TStateData>,
  selectorFn: ExternalStateSelector<TStateData, TSelected> = defaultStateSelector,
  deps?: DependencyList,
): TSelected {
  const selector = useCallback(memoize(selectorFn), deps ?? []);

  let currentData = useRef(selector(state.getSnapshot()));

  const getSnapshot = useCallback(() => selector(state.getSnapshot()), [selector, state]);

  return useSyncExternalStore(
    useCallback(
      (cb) => {
        return state.subscribe((data) => {
          const nextState = selector(data);
          if (currentData.current !== nextState) {
            currentData.current = nextState;
            cb();
          }
        });
      },
      [selector, state],
    ),
    getSnapshot,
    getSnapshot,
  );
}
