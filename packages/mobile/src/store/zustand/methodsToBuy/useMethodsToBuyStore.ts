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
import { fiatCurrencySelector } from '$store/main';
import { store } from '$store';

const initialState: Omit<IMethodsToBuyStore, 'actions'> = {
  selectedCountry: 'AUTO',
  layoutByCountry: [],
  categories: [],
  defaultLayout: {
    methods: ['mercuryo', 'neocrypto'],
  },
  lastUsedCountries: [],
};

export const useMethodsToBuyStore = create(
  persist<IMethodsToBuyStore>(
    (set) => ({
      ...initialState,
      actions: {
        setSelectedCountry: (selectedCountry: string) => {
          set((prevState) => ({
            selectedCountry,
            lastUsedCountries: ['AUTO', '*'].includes(selectedCountry)
              ? prevState.lastUsedCountries
              : [selectedCountry, prevState.lastUsedCountries[0]].filter(Boolean),
          }));
        },
        fetchMethodsToBuy: async () => {
          const isTestnet = await getIsTestnet();
          const currency = await fiatCurrencySelector(store.getState());
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
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as IMethodsToBuyStore;

        if (state.lastUsedCountries === undefined) {
          state.selectedCountry =
            state.selectedCountry === getCountry() ? 'AUTO' : state.selectedCountry;
          state.lastUsedCountries =
            state.selectedCountry !== 'AUTO' ? [state.selectedCountry] : [];
        }

        return state;
      },
      partialize: ({
        selectedCountry,
        categories,
        defaultLayout,
        layoutByCountry,
        lastUsedCountries,
      }) =>
        ({
          selectedCountry,
          categories,
          defaultLayout,
          layoutByCountry,
          lastUsedCountries,
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
