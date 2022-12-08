import {
  getConnectedAppByUrl,
  IAppMetadata,
  useAppsListStore,
  useConnectedAppsStore,
} from '$store';
import { useCallback, useMemo } from 'react';

export const useAppInfo = (
  walletAddress: string,
  webViewUrl: string,
): IAppMetadata | null => {
  const connectedApp = useConnectedAppsStore(
    useCallback(
      (state) => {
        const app = getConnectedAppByUrl(walletAddress, webViewUrl, state);

        return app ?? null;
      },
      [webViewUrl, walletAddress],
    ),
  );

  const appsList = useAppsListStore((s) => s.appsList);

  return useMemo(() => {
    if (connectedApp) {
      return connectedApp;
    }

    const app = appsList.find((item) => webViewUrl.startsWith(item.url));

    if (app) {
      return app;
    }

    return null;
  }, [appsList, connectedApp, webViewUrl]);
};
