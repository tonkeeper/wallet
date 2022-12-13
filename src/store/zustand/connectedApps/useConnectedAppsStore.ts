import { generateAppHashFromUrl } from '$utils';
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

              const hash = generateAppHashFromUrl(appData.url);

              const alreadyConnectedApp = connectedApps[chainName][walletAddress][hash];

              if (alreadyConnectedApp) {
                connectedApps[chainName][walletAddress][hash] = {
                  ...alreadyConnectedApp,
                  ...appData,
                  icon: appData.icon || alreadyConnectedApp.icon,
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
          removeApp: (chainName, walletAddress, url) => {
            const hash = generateAppHashFromUrl(url);

            set(({ connectedApps }) => {
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
