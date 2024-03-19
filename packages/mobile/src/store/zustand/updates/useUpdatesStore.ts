import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IUpdatesStore, UpdateState } from './types';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';
import { getUpdatePath } from '$store/zustand/updates/helpers';
import { config } from '$config';

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
          const res = await fetch(`${config.get('tonkeeperEndpoint')}/check-for-updates`);
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
          } else {
            set({ update: { state: UpdateState.NOT_STARTED, progress: 0 } });
            try {
              RNFS.unlink(getUpdatePath());
            } catch (e) {}
          }
        },
        startUpdate: async () => {
          const state = getState();
          let download = RNFS.downloadFile({
            fromUrl: `https://data2.ton.app/apk/tonkeeper.apk?requestVersion=${state.meta?.version}`,
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

          if (res.statusCode >= 200 && res.statusCode < 300) {
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
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ isLoading, update: { state, progress }, meta, declinedAt }) =>
        ({
          meta,
          update: {
            progress,
            state:
              state === UpdateState.DOWNLOADED
                ? UpdateState.DOWNLOADED
                : UpdateState.NOT_STARTED,
          },
          declinedAt,
          isLoading,
        } as IUpdatesStore),
    },
  ),
);
