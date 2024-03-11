import { getChainName } from '$shared/dynamicConfig';
import { getFixedLastSlashUrl } from '$utils';
import { IConnectedApp, IConnectedAppConnection, IConnectedAppsStore } from './types';
import { tk } from '$wallet';
import { Address } from '@tonkeeper/core';
import { WithWalletIdentifier } from '$wallet/WalletTypes';

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

export const getAllConnections = (state: IConnectedAppsStore) => {
  const allConnections: WithWalletIdentifier<IConnectedAppConnection>[] = [];

  tk.wallets.forEach((wallet) => {
    const walletAddress = Address.parse(wallet.address.ton.raw).toFriendly({
      bounceable: true,
      testOnly: wallet.isTestnet,
    });

    const apps =
      state.connectedApps[wallet.isTestnet ? 'testnet' : 'mainnet']?.[walletAddress] ??
      {};

    const connections = Object.values(apps).flatMap((app) =>
      app.connections.map((connection) => ({
        ...connection,
        walletIdentifier: wallet.identifier,
      })),
    );

    allConnections.push(...connections);
  });

  return allConnections;
};
