import {
  getConnectedAppByUrl,
  IAppMetadata,
  useAppsListStore,
  useConnectedAppsStore,
} from '$store';
import { getFixedLastSlashUrl } from '$utils';
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

    const url = getFixedLastSlashUrl(webViewUrl);

    const app = appsList.find((item) => url.startsWith(getFixedLastSlashUrl(item.url)));

    if (app) {
      return app;
    }

    return null;
  }, [appsList, connectedApp, webViewUrl]);
};
