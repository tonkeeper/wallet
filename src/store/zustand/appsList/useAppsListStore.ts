import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import FastImage from 'react-native-fast-image';
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { IAppsListStore } from './types';

const initialState: Omit<IAppsListStore, 'actions'> = {
  fetching: true,
  appsList: [],
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
              'https://nextjs-test-brown-eta.vercel.app/api/apps',
            );

            const apps = response.data.apps;

            FastImage.preload(
              apps.map((app) => ({
                uri: app.icon,
              })),
            );

            set({ appsList: response.data.apps });
          } finally {
            set({ fetching: false });
          }
        },
      },
    }),
    {
      name: 'appsListStore',
      getStorage: () => AsyncStorage,
      partialize: ({ appsList }) => ({ appsList } as IAppsListStore),
    },
  ),
);
