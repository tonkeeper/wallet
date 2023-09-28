import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { INotification, INotificationsStore } from './types';
import { getDomainFromURL } from '$utils';
import { hasGmsSync } from 'react-native-device-info';

const initialState: Omit<INotificationsStore, 'actions'> = {
  last_seen: Date.now(),
  last_seen_activity_screen: Date.now(),
  has_gms: hasGmsSync(),
  should_show_red_dot: false,
  notifications: [],
};

export const useNotificationsStore = create(
  persist<INotificationsStore>(
    (set) => ({
      ...initialState,
      actions: {
        updateLastSeen: () => set({ last_seen: new Date().getTime() }),
        updateLastSeenActivityScreen: () =>
          set({ last_seen_activity_screen: new Date().getTime() }),
        addNotification: (notification: INotification) =>
          set((state) => ({
            notifications: [notification, ...state.notifications],
            should_show_red_dot: true,
          })),
        removeRedDot: () => set({ should_show_red_dot: false }),
        deleteNotificationByReceivedAt: (receivedAt) =>
          set((state) => ({
            should_show_red_dot: false,
            notifications: state.notifications.filter(
              (notification) => notification.received_at !== receivedAt,
            ),
          })),
        removeNotificationsByDappUrl: (dapp_url) => {
          set((state) => ({
            should_show_red_dot: false,
            notifications: state.notifications.filter(
              (notification) =>
                notification.dapp_url &&
                getDomainFromURL(notification.dapp_url) !== getDomainFromURL(dapp_url),
            ),
          }));
        },
        reset: () => set({ last_seen: 0, notifications: [] }),
      },
    }),
    {
      name: 'notifications',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persistedState: INotificationsStore, version) => {
        if (version === 1) {
          persistedState.has_gms = hasGmsSync();
        }

        return persistedState;
      },
      partialize: ({
        notifications,
        last_seen,
        should_show_red_dot,
        last_seen_activity_screen,
      }) =>
        ({
          notifications,
          last_seen,
          should_show_red_dot,
          last_seen_activity_screen,
        } as INotificationsStore),
    },
  ),
);
