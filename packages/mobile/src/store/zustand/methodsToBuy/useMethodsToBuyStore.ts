import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IMethodsToBuyStore } from './types';
import { getCountry } from 'react-native-localize';
import axios from 'axios';
import { getServerConfig } from '$shared/constants';
import { i18n } from '$translation';
import DeviceInfo from 'react-native-device-info';
import { getIsTestnet } from '$database';
import { tk } from '@tonkeeper/shared/tonkeeper';

const initialState: Omit<IMethodsToBuyStore, 'actions'> = {
  selectedCountry: getCountry(),
  layoutByCountry: [],
  categories: [],
  defaultLayout: {
    methods: ['mercuryo', 'neocrypto'],
  },
};

export const useMethodsToBuyStore = create(
  persist<IMethodsToBuyStore>(
    (set) => ({
      ...initialState,
      actions: {
        setSelectedCountry: (selectedCountry: string) => set({ selectedCountry }),
        fetchMethodsToBuy: async () => {
          const isTestnet = await getIsTestnet();
          const currency = tk.wallet.state.getSnapshot().currency;
          const resp = await axios.get(
            `${getServerConfig('tonkeeperEndpoint')}/fiat/methods`,
            {
              params: {
                lang: i18n.locale,
                build: DeviceInfo.getReadableVersion(),
                chainName: isTestnet ? 'testnet' : 'mainnet',
                currency,
              },
            },
          );
          set(resp.data.data);
        },
      },
    }),
    {
      name: 'fiat-methods',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ selectedCountry, categories, defaultLayout, layoutByCountry }) =>
        ({
          selectedCountry,
          categories,
          defaultLayout,
          layoutByCountry,
        } as IMethodsToBuyStore),
    },
  ),
);

export function useFetchMethodsToBuy() {
  const fetchMethodsToBuy = useMethodsToBuyStore(
    (state) => state.actions.fetchMethodsToBuy,
  );

  useEffect(() => {
    fetchMethodsToBuy();
  }, [fetchMethodsToBuy]);
}
