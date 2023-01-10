import { generateAppHashFromUrl, getFixedLastSlashUrl } from '$utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import create from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { IConnectedAppsStore, TonConnectBridgeType } from './types';

const initialState: Omit<IConnectedAppsStore, 'actions'> = {
  connectedApps: {
    mainnet: {},
    testnet: {},
  },
};

export const useConnectedAppsStore = create(
  subscribeWithSelector(
    persist<IConnectedAppsStore>(
      (set) => ({
        ...initialState,
        actions: {
          saveAppConnection: (chainName, walletAddress, appData, connection) => {
            set(({ connectedApps }) => {
              if (!connectedApps[chainName][walletAddress]) {
                connectedApps[chainName][walletAddress] = {};
              }

              const hash = generateAppHashFromUrl(appData.url);

              const alreadyConnectedApp = connectedApps[chainName][walletAddress][hash];

              if (alreadyConnectedApp) {
                connectedApps[chainName][walletAddress][hash] = {
                  ...alreadyConnectedApp,
                  ...appData,
                  icon: appData.icon || alreadyConnectedApp.icon,
                  autoConnectDisabled:
                    alreadyConnectedApp.autoConnectDisabled &&
                    connection?.type !== TonConnectBridgeType.Injected,
                  connections: connection
                    ? [...alreadyConnectedApp.connections, connection]
                    : alreadyConnectedApp.connections,
                };
              } else {
                connectedApps[chainName][walletAddress][hash] = {
                  ...appData,
                  connections: connection ? [connection] : [],
                };
              }

              return { connectedApps };
            });
          },
          removeInjectedConnection: (chainName, walletAddress, url) => {
            const fixedUrl = getFixedLastSlashUrl(url);

            set(({ connectedApps }) => {
              const keys = Object.keys(connectedApps[chainName][walletAddress] || {});

              const apps = Object.values(connectedApps[chainName][walletAddress] || {});

              const index = apps.findIndex((app) =>
                fixedUrl.startsWith(getFixedLastSlashUrl(app.url)),
              );

              const hash = keys[index];

              if (connectedApps[chainName][walletAddress]?.[hash]) {
                connectedApps[chainName][walletAddress][hash].autoConnectDisabled = true;

                connectedApps[chainName][walletAddress][hash].connections = connectedApps[
                  chainName
                ][walletAddress][hash].connections.filter(
                  (connection) => connection.type !== TonConnectBridgeType.Injected,
                );

                if (
                  connectedApps[chainName][walletAddress][hash].connections.length === 0
                ) {
                  delete connectedApps[chainName][walletAddress][hash];
                }
              }

              return { connectedApps };
            });
          },
          removeApp: (chainName, walletAddress, url) => {
            const fixedUrl = getFixedLastSlashUrl(url);

            set(({ connectedApps }) => {
              const keys = Object.keys(connectedApps[chainName][walletAddress] || {});

              const apps = Object.values(connectedApps[chainName][walletAddress] || {});

              const index = apps.findIndex((app) =>
                fixedUrl.startsWith(getFixedLastSlashUrl(app.url)),
              );

              const hash = keys[index];

              if (connectedApps[chainName][walletAddress]?.[hash]) {
                delete connectedApps[chainName][walletAddress][hash];
              }

              return { connectedApps };
            });
          },
        },
      }),
      {
        name: 'TCApps',
        getStorage: () => AsyncStorage,
        partialize: ({ connectedApps }) => ({ connectedApps } as IConnectedAppsStore),
      },
    ),
  ),
);
