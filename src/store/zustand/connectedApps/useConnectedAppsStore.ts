import { getDomainFromURL } from '$utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import create from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { IConnectedAppsStore } from './types';

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

              const domain = getDomainFromURL(appData.url);

              const alreadyConnectedApp = connectedApps[chainName][walletAddress][domain];

              if (alreadyConnectedApp) {
                connectedApps[chainName][walletAddress][domain] = {
                  ...alreadyConnectedApp,
                  ...appData,
                  icon: appData.icon || alreadyConnectedApp.icon,
                  connections: connection
                    ? [...alreadyConnectedApp.connections, connection]
                    : alreadyConnectedApp.connections,
                };
              } else {
                connectedApps[chainName][walletAddress][domain] = {
                  ...appData,
                  connections: connection ? [connection] : [],
                };
              }

              return { connectedApps };
            });
          },
          removeApp: (chainName, walletAddress, url) => {
            set(({ connectedApps }) => {
              const domain = getDomainFromURL(url);

              if (connectedApps[chainName][walletAddress]?.[domain]) {
                delete connectedApps[chainName][walletAddress][domain];
              }

              return { connectedApps };
            });
          },
        },
      }),
      {
        name: 'tonConnectedApps',
        getStorage: () => AsyncStorage,
        partialize: ({ connectedApps }) => ({ connectedApps } as IConnectedAppsStore),
      },
    ),
  ),
);
