import { getChainName } from '$shared/dynamicConfig';
import { getConnectedAppByUrl } from './selectors';
import {
  IConnectedAppConnection,
  IConnectedApp,
  TonConnectBridgeType,
  IConnectedAppConnectionRemote,
} from './types';
import { useConnectedAppsStore } from './useConnectedAppsStore';
import { Address } from '@tonkeeper/core';
import { tk } from '$wallet';

const getWalletAddress = () => {
  return Address.parse(tk.wallet.address.ton.raw).toString({
    bounceable: true, // TODO: for compatibility we are working with bounceable address format in connectedAppsStore. Should migrate to raw in future
    testOnly: tk.wallet.isTestnet,
  });
};

export const saveAppConnection = (
  isTestnet: boolean,
  walletAddress: string,
  appData: Omit<IConnectedApp, 'connections'>,
  connection: IConnectedAppConnection,
) => {
  useConnectedAppsStore
    .getState()
    .actions.saveAppConnection(
      isTestnet ? 'testnet' : 'mainnet',
      walletAddress,
      appData,
      connection,
    );
};

export const enableNotifications = async (
  isTestnet: boolean,
  walletAddress: string,
  url: IConnectedApp['url'],
  sessionId: string | undefined,
) => {
  try {
    useConnectedAppsStore
      .getState()
      .actions.enableNotifications(
        isTestnet ? 'testnet' : 'mainnet',
        walletAddress,
        url,
        sessionId,
      );
  } catch (e) {
    console.log(e);
  }
};

export const disableNotifications = async (
  walletAddress: string,
  url: IConnectedApp['url'],
) => {
  try {
    useConnectedAppsStore
      .getState()
      .actions.disableNotifications(getChainName(), walletAddress, url);
  } catch (e) {
    console.log(e);
  }
};

export const removeConnectedApp = (url: string) => {
  const currentWalletAddress = getWalletAddress();

  useConnectedAppsStore
    .getState()
    .actions.removeApp(getChainName(), currentWalletAddress, url);
};

export const removeInjectedConnection = (url: string) => {
  const currentWalletAddress = getWalletAddress();

  useConnectedAppsStore
    .getState()
    .actions.removeInjectedConnection(getChainName(), currentWalletAddress, url);
};

export const removeRemoteConnection = (
  isTestnet: boolean,
  connectedApp: IConnectedApp,
  connection: IConnectedAppConnectionRemote,
) => {
  const currentWalletAddress = getWalletAddress();

  useConnectedAppsStore
    .getState()
    .actions.removeRemoteConnection(
      isTestnet ? 'testnet' : 'mainnet',
      currentWalletAddress,
      connectedApp.url,
      connection.clientSessionId,
    );
};

export const findConnectedAppByUrl = (url: string): IConnectedApp | null => {
  const currentWalletAddress = getWalletAddress();

  return getConnectedAppByUrl(
    currentWalletAddress,
    url,
    useConnectedAppsStore.getState(),
  );
};

export const findConnectedAppByClientSessionId = (
  clientSessionId: string,
  walletIdentifier: string,
): { connectedApp: IConnectedApp | null; connection: IConnectedAppConnection | null } => {
  const wallet = tk.wallets.get(walletIdentifier);

  if (!wallet) {
    return { connectedApp: null, connection: null };
  }

  const currentWalletAddress = Address.parse(wallet.address.ton.raw).toString({
    bounceable: true,
    testOnly: wallet.isTestnet,
  });

  const connectedAppsList = Object.values(
    useConnectedAppsStore.getState().connectedApps[
      wallet.isTestnet ? 'testnet' : 'mainnet'
    ][currentWalletAddress] || {},
  );

  let connection: IConnectedAppConnection | null = null;

  const connectedApp = connectedAppsList.find((app) =>
    app.connections.find((item) => {
      if (
        item.type === TonConnectBridgeType.Remote &&
        item.clientSessionId === clientSessionId
      ) {
        connection = item;

        return true;
      }

      return false;
    }),
  );

  return { connectedApp: connectedApp ?? null, connection };
};
