import { generateAppHashFromUrl, getFixedLastSlashUrl } from '$utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { IConnectedAppsStore, TonConnectBridgeType } from './types';
import { Tonapi } from '$libs/Tonapi';
import messaging from '@react-native-firebase/messaging';
import * as SecureStore from 'expo-secure-store';
import { useNotificationsStore } from '$store/zustand';

const initialState: Omit<IConnectedAppsStore, 'actions'> = {
  connectedApps: {
    mainnet: {},
    testnet: {},
  },
};

export const useConnectedAppsStore = create(
  subscribeWithSelector(
    persist<IConnectedAppsStore>(
      (set, get) => ({
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
          removeInjectedConnection: async (chainName, walletAddress, url) => {
            const fixedUrl = getFixedLastSlashUrl(url);

            get().actions.disableNotifications(chainName, walletAddress, url);

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
          removeRemoteConnection: async (
            chainName,
            walletAddress,
            url,
            clientSessionId,
          ) => {
            const fixedUrl = getFixedLastSlashUrl(url);

            get().actions.disableNotifications(chainName, walletAddress, url);

            set(({ connectedApps }) => {
              const keys = Object.keys(connectedApps[chainName][walletAddress] || {});

              const apps = Object.values(connectedApps[chainName][walletAddress] || {});

              const index = apps.findIndex((app) =>
                fixedUrl.startsWith(getFixedLastSlashUrl(app.url)),
              );

              const hash = keys[index];

              if (connectedApps[chainName][walletAddress]?.[hash]) {
                connectedApps[chainName][walletAddress][hash].connections = connectedApps[
                  chainName
                ][walletAddress][hash].connections.filter(
                  (connection) =>
                    !(
                      connection.type === TonConnectBridgeType.Remote &&
                      connection.clientSessionId === clientSessionId
                    ),
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
          enableNotifications: async (
            chainName,
            walletAddress,
            url,
            session_id,
            firebase_token,
          ) => {
            const fixedUrl = getFixedLastSlashUrl(url);
            const token = await SecureStore.getItemAsync('proof_token');

            if (!token) {
              return;
            }

            Tonapi.subscribeToNotifications(token, {
              app_url: fixedUrl,
              session_id: session_id,
              account: walletAddress,
              commercial: true,
              firebase_token,
            });

            set(({ connectedApps }) => {
              const keys = Object.keys(connectedApps[chainName][walletAddress] || {});

              const apps = Object.values(connectedApps[chainName][walletAddress] || {});

              const index = apps.findIndex((app) =>
                fixedUrl.startsWith(getFixedLastSlashUrl(app.url)),
              );

              const hash = keys[index];

              if (connectedApps[chainName][walletAddress]?.[hash]) {
                connectedApps[chainName][walletAddress][hash].notificationsEnabled = true;
              }

              return { connectedApps };
            });
          },
          disableNotifications: async (chainName, walletAddress, url, firebase_token) => {
            const fixedUrl = getFixedLastSlashUrl(url);
            const token = await SecureStore.getItemAsync('proof_token');

            if (!token) {
              return;
            }

            useNotificationsStore.getState().actions.removeNotificationsByDappUrl(url);

            Tonapi.unsubscribeFromNotifications(token, {
              firebase_token,
              app_url: fixedUrl,
            });

            set(({ connectedApps }) => {
              const keys = Object.keys(connectedApps[chainName][walletAddress] || {});

              const apps = Object.values(connectedApps[chainName][walletAddress] || {});

              const index = apps.findIndex((app) =>
                fixedUrl.startsWith(getFixedLastSlashUrl(app.url)),
              );

              const hash = keys[index];

              if (connectedApps[chainName][walletAddress]?.[hash]) {
                connectedApps[chainName][walletAddress][hash].notificationsEnabled =
                  false;
              }

              return { connectedApps };
            });
          },
          removeApp: async (chainName, walletAddress, url) => {
            const fixedUrl = getFixedLastSlashUrl(url);

            get().actions.disableNotifications(chainName, walletAddress, url);

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
