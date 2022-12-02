import { getServerConfig } from '$shared/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import FastImage from 'react-native-fast-image';
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { IAppsListStore } from './types';

const initialState: Omit<IAppsListStore, 'actions'> = {
  fetching: true,
  appsList: [],
  moreEnabled: false,
};

export const useAppsListStore = create(
  persist<IAppsListStore>(
    (set) => ({
      ...initialState,
      actions: {
        fetchPopularApps: async () => {
          set({ fetching: true });
          try {
            const response = await axios.get(
              `${getServerConfig('tonkeeperEndpoint')}/apps/popular`,
            );

            const { apps, moreEnabled } = response.data.data;

            FastImage.preload(
              apps.map((app) => ({
                uri: app.icon,
              })),
            );

            set({ appsList: apps, moreEnabled });
          } catch {
          } finally {
            set({ fetching: false });
          }
        },
      },
    }),
    {
      name: 'appsList',
      getStorage: () => AsyncStorage,
      partialize: ({ appsList, moreEnabled }) =>
        ({ appsList, moreEnabled } as IAppsListStore),
    },
  ),
);
