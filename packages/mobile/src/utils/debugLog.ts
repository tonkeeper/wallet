import { store } from '$store';
import { mainActions } from '$store/main';
import { getCurrentRoute } from '$navigation/imperative';

export function debugLog(...args: any) {
  console.log('[debugLog]', ...args);
  store.dispatch(
    mainActions.addLog({
      log: args.length === 1 ? args[0] : args,
      trace: null,
      screen: getCurrentRoute()?.name ?? 'Unknown',
    }),
  );
}
