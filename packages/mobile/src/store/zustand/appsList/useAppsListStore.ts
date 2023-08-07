import { getServerConfig } from '$shared/constants';
import { i18n } from '$translation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import FastImage from 'react-native-fast-image';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IAppCategory, IAppsListStore } from './types';
import DeviceInfo from 'react-native-device-info';

const initialState: Omit<IAppsListStore, 'actions'> = {
  fetching: true,
  appsList: [],
  categories: [],
  moreEnabled: false,
  moreUrl: '',
};

export const useAppsListStore = create(
  persist<IAppsListStore>(
    (set) => ({
      ...initialState,
      actions: {
        fetchPopularApps: async () => {
          set({ fetching: true });
          try {
            const response = await axios.get(`${getServerConfig('tonkeeperEndpoint')}/apps/popular`, {
              params: {
                lang: i18n.locale,
                build: DeviceInfo.getReadableVersion(),
              }
            });

            const { categories, moreEnabled, moreUrl } = response.data.data as {
              categories: IAppCategory[];
              moreEnabled: boolean;
              moreUrl: string;
            };

            const apps = categories.map((c) => c.apps).flat();

            const sources =
              categories?.[0]?.apps.map((app) => ({
                uri: app.icon,
              })) || [];

            FastImage.preload(sources);

            set({
              appsList: apps,
              categories,
              moreEnabled,
              moreUrl,
            });
          } catch {
          } finally {
            set({ fetching: false });
          }
        },
      },
    }),
    {
      name: 'appsList',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ categories, appsList, moreEnabled }) =>
        ({ categories, appsList, moreEnabled } as IAppsListStore),
    },
  ),
);

useAppsListStore.getState().actions.fetchPopularApps();
