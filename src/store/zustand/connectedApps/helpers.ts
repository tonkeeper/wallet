import { getChainName } from '$shared/dynamicConfig';
import { store } from '$store';
import { getConnectedAppByUrl } from './selectors';
import { IConnectedAppConnection, IConnectedApp, TonConnectBridgeType } from './types';
import { useConnectedAppsStore } from './useConnectedAppsStore';

export const saveAppConnection = (
  walletAddress: string,
  appData: Omit<IConnectedApp, 'connections'>,
  connection: IConnectedAppConnection,
) => {
  useConnectedAppsStore
    .getState()
    .actions.saveAppConnection(getChainName(), walletAddress, appData, connection);
};

export const removeConnectedApp = (url: string) => {
  const currentWalletAddress = store.getState().wallet.address.ton;

  useConnectedAppsStore
    .getState()
    .actions.removeApp(getChainName(), currentWalletAddress, url);
};

export const findConnectedAppByUrl = (url: string): IConnectedApp | null => {
  const currentWalletAddress = store.getState().wallet?.address?.ton;

  return getConnectedAppByUrl(
    currentWalletAddress,
    url,
    useConnectedAppsStore.getState(),
  );
};

export const findConnectedAppByClientSessionId = (
  clientSessionId: string,
): { connectedApp: IConnectedApp | null; connection: IConnectedAppConnection | null } => {
  const currentWalletAddress = store.getState().wallet?.address?.ton;

  const connectedAppsList = Object.values(
    useConnectedAppsStore.getState().connectedApps[getChainName()][
      currentWalletAddress
    ] || {},
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
