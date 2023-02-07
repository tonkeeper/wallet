import { getChainName } from '$shared/dynamicConfig';
import { getFixedLastSlashUrl } from '$utils';
import concat from 'lodash/concat';
import { IConnectedApp, IConnectedAppsStore } from './types';

export const getConnectedAppByUrl = (
  walletAddress: string,
  url: string,
  state: IConnectedAppsStore,
): IConnectedApp | null => {
  const apps = Object.values(state.connectedApps[getChainName()][walletAddress] || {});

  const fixedUrl = getFixedLastSlashUrl(url);

  const connectedApp = apps.find((app) =>
    fixedUrl.startsWith(getFixedLastSlashUrl(app.url)),
  );

  return connectedApp ?? null;
};

export const getAllConnections = (state: IConnectedAppsStore, walletAddress: string) => {
  const apps = Object.values(state.connectedApps[getChainName()][walletAddress] || {});

  const connections = concat(...apps.map((app) => app.connections));

  return connections;
};
