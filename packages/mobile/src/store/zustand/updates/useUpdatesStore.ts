import { getServerConfig } from '$shared/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUpdatesStore, UpdateState } from './types';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';
import { getUpdatePath } from '$store/zustand/updates/helpers';

const initialState: Omit<IUpdatesStore, 'actions'> = {
  isLoading: false,
  shouldUpdate: false,
  update: {
    state: UpdateState.NOT_STARTED,
    progress: 0,
  },
};

export const useUpdatesStore = create(
  persist<IUpdatesStore>(
    (set, getState) => ({
      ...initialState,
      actions: {
        fetchMeta: async () => {
          set({ isLoading: true });
          const oldMeta = getState().meta;
          const res = await fetch(
            `${getServerConfig('tonkeeperEndpoint')}/check-for-updates`,
          );
          const data = await res.json();
          set({ meta: data, isLoading: false });
          if (oldMeta?.version !== data?.version) {
            set({ declinedAt: undefined });
          }
          if (
            DeviceInfo.getVersion() < data?.version &&
            (!getState().declinedAt ||
              // @ts-ignore
              getState().declinedAt < Date.now() - 7 * 24 * 60 * 60 * 1000)
          ) {
            set({ shouldUpdate: true, declinedAt: undefined });
          }
        },
        startUpdate: async () => {
          let download = RNFS.downloadFile({
            fromUrl: 'https://data2.ton.app/apk/tonkeeper.apk',
            toFile: getUpdatePath(),
            progress: (res) => {
              set({
                update: {
                  state: UpdateState.DOWNLOADING,
                  progress: Math.round((res.bytesWritten / res.contentLength) * 100),
                },
              });
            },
            progressDivider: 1,
          });
          const res = await download.promise;

          if (200 <= res.statusCode && res.statusCode < 300) {
            set({ update: { state: UpdateState.DOWNLOADED, progress: 100 } });
            return;
          }

          set({ update: { state: UpdateState.ERRORED, progress: 0 } });
        },
        declineUpdate: () => {
          set({ declinedAt: Date.now() });
        },
      },
    }),
    {
      name: 'updates',
      getStorage: () => AsyncStorage,
      partialize: ({ isLoading, meta, declinedAt }) =>
        ({ meta, declinedAt, isLoading } as IUpdatesStore),
    },
  ),
);
