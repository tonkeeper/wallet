import { getChainName } from '$shared/dynamicConfig';
import concat from 'lodash/concat';
import { IConnectedApp, IConnectedAppsStore } from './types';

export const getConnectedAppByDomain = (
  walletAddress: string,
  domain: string,
  state: IConnectedAppsStore,
): IConnectedApp | null => {
  const connectedApp = state.connectedApps[getChainName()][walletAddress]?.[domain];

  return connectedApp ?? null;
};

export const getAllConnections = (state: IConnectedAppsStore, walletAddress: string) => {
  const apps = Object.values(state.connectedApps[getChainName()][walletAddress] || {});

  const connections = concat(...apps.map((app) => app.connections));

  return connections;
};
