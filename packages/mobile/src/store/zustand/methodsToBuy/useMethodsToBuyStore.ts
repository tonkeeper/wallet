import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IExchangeCategory, IMethodsToBuyStore } from './types';
import { getCountry } from 'react-native-localize';
import axios from 'axios';
import { i18n } from '$translation';
import DeviceInfo from 'react-native-device-info';
import { flatMap, uniqBy } from 'lodash';
import { tk } from '$wallet';
import { config } from '$config';
import { Platform } from 'react-native';

const initialState: Omit<IMethodsToBuyStore, 'actions'> = {
  selectedCountry: 'AUTO',
  layoutByCountry: [],
  buy: [],
  sell: [],
  allMethods: [],
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
            lastUsedCountries:
              ['AUTO', '*'].includes(selectedCountry) ||
              prevState.lastUsedCountries.includes(selectedCountry)
                ? prevState.lastUsedCountries
                : [selectedCountry, prevState.lastUsedCountries[0]].filter(Boolean),
          }));
        },
        fetchMethodsToBuy: async () => {
          const currency = tk.tonPrice.state.data.currency;
          const resp = await axios.get(
            `${config.get('tonkeeperEndpoint')}/fiat/methods`,
            {
              params: {
                platform: Platform.OS,
                lang: i18n.locale,
                build: DeviceInfo.getVersion(),
                chainName: 'mainnet',
                currency,
              },
            },
          );

          const allMethods = uniqBy(
            flatMap(
              [...resp.data.data.buy, ...resp.data.data.sell] as IExchangeCategory[],
              (item) => item.items,
            ),
            'id',
          );

          set({ ...resp.data.data, allMethods });
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
        defaultLayout,
        layoutByCountry,
        lastUsedCountries,
        buy,
        sell,
        allMethods,
      }) =>
        ({
          selectedCountry,
          defaultLayout,
          layoutByCountry,
          lastUsedCountries,
          buy,
          sell,
          allMethods,
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
