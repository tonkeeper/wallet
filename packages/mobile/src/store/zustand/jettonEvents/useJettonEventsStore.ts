import { CryptoCurrencies, getServerConfig } from '$shared/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Configuration, JettonApi } from 'tonapi-sdk-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IJettonEventsStore } from './types';

const initialState: Omit<IJettonEventsStore, 'actions'> = {
  jettons: {},
};

export const useJettonEventsStore = create(
  persist<IJettonEventsStore>(
    (set) => ({
      ...initialState,
      actions: {
        fetchJettonEvents: async (address, jettonMaster, isRefresh) => {
          set((state) => ({
            ...state,
            jettons: {
              ...state.jettons,
              [jettonMaster]: {
                ...state.jettons[jettonMaster],
                isLoading: true,
                isRefreshing: !!isRefresh,
              },
            },
          }));
          const jettonApi = new JettonApi(
            new Configuration({
              basePath: getServerConfig('tonapiIOEndpoint'),
              headers: {
                Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
              },
            }),
          );
          const { events } = await jettonApi.getJettonHistory({
            account: address,
            jettonMaster,
            limit: 1000,
          });
          if (!events) {
            set((state) => ({
              ...state,
              jettons: {
                ...state.jettons,
                [jettonMaster]: {
                  ...state.jettons[jettonMaster],
                  isLoading: false,
                  isRefreshing: false,
                },
              },
            }));
            return;
          }
          const eventsMap = events.reduce((acc, event) => {
            acc[event.eventId] = {
              ...event,
              actions: event.actions.filter((action) => action.type === 'JettonTransfer'),
              currency: CryptoCurrencies.Ton,
            };
            return acc;
          }, {});
          set((state) => ({
            ...state,
            jettons: {
              ...state.jettons,
              [jettonMaster]: {
                ...state.jettons[jettonMaster],
                events: eventsMap,
              },
            },
          }));
          set((state) => ({
            ...state,
            jettons: {
              ...state.jettons,
              [jettonMaster]: {
                ...state.jettons[jettonMaster],
                isLoading: false,
                isRefreshing: false,
              },
            },
          }));
        },
      },
    }),
    {
      name: 'jetton-events',
      getStorage: () => AsyncStorage,
      partialize: ({ jettons }) => ({ jettons } as IJettonEventsStore),
    },
  ),
);
