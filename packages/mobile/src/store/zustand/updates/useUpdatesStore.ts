import { CryptoCurrencies, getServerConfig } from '$shared/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Configuration, JettonApi } from 'tonapi-sdk-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUpdatesStore } from './types';

const initialState: Omit<IUpdatesStore, 'actions'> = {
  isLoading: false,
};

export const useUpdatesStore = create(
  persist<IUpdatesStore>(
    (set) => ({
      ...initialState,
      actions: {
        fetchMeta: async () => {
          set({ isLoading: true });
          const res = await fetch(
            `${getServerConfig('tonkeeperEndpoint')}/check-for-updates`,
          );
          const data = await res.json();
          set({ meta: data, isLoading: false });
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
