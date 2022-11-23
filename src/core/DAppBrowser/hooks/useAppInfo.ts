import {
  getConnectedAppByDomain,
  IAppMetadata,
  useAppsListStore,
  useConnectedAppsStore,
} from '$store';
import { getDomainFromURL } from '$utils';
import { useCallback, useMemo } from 'react';

export const useAppInfo = (
  walletAddress: string,
  webViewUrl: string,
): IAppMetadata | null => {
  const domain = getDomainFromURL(webViewUrl);

  const connectedApp = useConnectedAppsStore(
    useCallback(
      (state) => {
        const app = getConnectedAppByDomain(walletAddress, domain, state);

        return app ?? null;
      },
      [domain, walletAddress],
    ),
  );

  const appsList = useAppsListStore((s) => s.appsList);

  return useMemo(() => {
    if (connectedApp) {
      return connectedApp;
    }

    const app = appsList.find((item) => getDomainFromURL(item.url) === domain);

    if (app) {
      return app;
    }

    return null;
  }, [appsList, connectedApp, domain]);
};
