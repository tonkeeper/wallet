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

              const alreadyConnectedApp = connectedApps[chainName][walletAddress][appData.url];

              if (alreadyConnectedApp) {
                connectedApps[chainName][walletAddress][appData.url] = {
                  ...alreadyConnectedApp,
                  ...appData,
                  icon: appData.icon || alreadyConnectedApp.icon,
                  connections: connection
                    ? [...alreadyConnectedApp.connections, connection]
                    : alreadyConnectedApp.connections,
                };
              } else {
                connectedApps[chainName][walletAddress][appData.url] = {
                  ...appData,
                  connections: connection ? [connection] : [],
                };
              }

              return { connectedApps };
            });
          },
          removeApp: (chainName, walletAddress, url) => {
            set(({ connectedApps }) => {

              if (connectedApps[chainName][walletAddress]?.[url]) {
                delete connectedApps[chainName][walletAddress][url];
              }

              return { connectedApps };
            });
          },
        },
      }),
      {
        name: 'TonConnectedApps',
        getStorage: () => AsyncStorage,
        partialize: ({ connectedApps }) => ({ connectedApps } as IConnectedAppsStore),
      },
    ),
  ),
);
