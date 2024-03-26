import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { INotification, INotificationsStore } from './types';
import { getDomainFromURL } from '$utils';
import { hasGmsSync } from 'react-native-device-info';

const initialState: Omit<INotificationsStore, 'actions'> = {
  has_gms: hasGmsSync(),
  wallets: {},
};

export const useNotificationsStore = create(
  persist<INotificationsStore>(
    (set) => ({
      ...initialState,
      actions: {
        updateLastSeen: (rawAddress) => {
          set((state) => {
            const wallet = state.wallets[rawAddress];
            return {
              wallets: {
                ...state.wallets,
                [rawAddress]: {
                  ...wallet,
                  last_seen: new Date().getTime(),
                },
              },
            };
          });
        },
        updateLastSeenActivityScreen: (rawAddress) => {
          set((state) => {
            const wallet = state.wallets[rawAddress];
            return {
              wallets: {
                ...state.wallets,
                [rawAddress]: {
                  ...wallet,
                  last_seen_activity_screen: new Date().getTime(),
                },
              },
            };
          });
        },
        addNotification: (notification: INotification, rawAddress) =>
          set((state) => {
            const wallet = state.wallets[rawAddress];
            const notifications = wallet?.notifications ?? [];
            return {
              wallets: {
                ...state.wallets,
                [rawAddress]: {
                  ...wallet,
                  notifications: [...notifications, notification],
                  should_show_red_dot: true,
                },
              },
            };
          }),
        removeRedDot: (rawAddress) => {
          set((state) => {
            const wallet = state.wallets[rawAddress];
            return {
              wallets: {
                ...state.wallets,
                [rawAddress]: {
                  ...wallet,
                  should_show_red_dot: false,
                },
              },
            };
          });
        },
        deleteNotificationByReceivedAt: (receivedAt, rawAddress) =>
          set((state) => {
            const wallet = state.wallets[rawAddress];
            const notifications = wallet?.notifications ?? [];
            return {
              wallets: {
                ...state.wallets,
                [rawAddress]: {
                  ...wallet,
                  should_show_red_dot: false,
                  notifications: notifications.filter(
                    (notification) => notification.received_at !== receivedAt,
                  ),
                },
              },
            };
          }),
        removeNotificationsByDappUrl: (dapp_url, rawAddress) => {
          set((state) => {
            const wallet = state.wallets[rawAddress];
            const notifications = wallet?.notifications ?? [];
            return {
              wallets: {
                ...state.wallets,
                [rawAddress]: {
                  ...wallet,
                  should_show_red_dot: false,
                  notifications: notifications.filter(
                    (notification) =>
                      notification.dapp_url &&
                      getDomainFromURL(notification.dapp_url) !==
                        getDomainFromURL(dapp_url),
                  ),
                },
              },
            };
          });
        },
        toggleRestakeBanner: (
          rawAddress: string,
          showRestakeBanner: boolean,
          stakingAddressToMigrateFrom?: string,
        ) => {
          set((state) => {
            const wallet = state.wallets[rawAddress];
            return {
              wallets: {
                ...state.wallets,
                [rawAddress]: {
                  ...wallet,
                  showRestakeBanner,
                  bypassUnstakeStep: false,
                  ...(stakingAddressToMigrateFrom ? { stakingAddressToMigrateFrom } : {}),
                },
              },
            };
          });
        },
        bypassUnstakeStep: (rawAddress) => {
          set((state) => {
            const wallet = state.wallets[rawAddress];
            return {
              wallets: {
                ...state.wallets,
                [rawAddress]: {
                  ...wallet,
                  bypassUnstakeStep: true,
                },
              },
            };
          });
        },
        reset: () => set(initialState),
      },
    }),
    {
      name: 'notificationsMultiwallet',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ wallets }) => ({ wallets } as INotificationsStore),
    },
  ),
);
