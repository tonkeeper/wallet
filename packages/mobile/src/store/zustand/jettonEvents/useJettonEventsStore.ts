import { CryptoCurrencies, getServerConfig } from '$shared/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Configuration, AccountsApi } from '@tonkeeper/core/src/legacy';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IJettonEventsStore } from './types';

const initialState: Omit<IJettonEventsStore, 'actions'> = {
  jettons: {},
};

export const useJettonEventsStore = create(
  persist<IJettonEventsStore>(
    (set) => ({
      ...initialState,
      actions: {
        clearStore: () => {
          set(initialState);
        },
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
          const accountsApi = new AccountsApi(
            new Configuration({
              basePath: getServerConfig('tonapiIOEndpoint'),
              headers: {
                Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
              },
            }),
          );
          const { events } = await accountsApi.getJettonsHistoryByID({
            accountId: address,
            jettonId: jettonMaster,
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
      name: 'jetton-events1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ jettons }) => ({ jettons } as IJettonEventsStore),
    },
  ),
);
