import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INotification, INotificationsStore } from './types';

const initialState: Omit<INotificationsStore, 'actions'> = {
  last_seen: 0,
  notifications: [],
  notifications_token: null,
};

export const useNotificationsStore = create(
  persist<INotificationsStore>(
    (set) => ({
      ...initialState,
      actions: {
        updateLastSeen: () => set({ last_seen: new Date().getTime() }),
        addNotification: (notification: INotification) =>
          set((state) => ({
            notifications: [notification, ...state.notifications],
          })),
        deleteNotificationByReceivedAt: (receivedAt) =>
          set((state) => ({
            notifications: state.notifications.filter(
              (notification) => notification.received_at !== receivedAt,
            ),
          })),
        setNotificationsToken: (token) => set({ notifications_token: token }),
        reset: () => set({ last_seen: 0, notifications: [] }),
      },
    }),
    {
      name: 'notifications',
      getStorage: () => AsyncStorage,
      partialize: ({ notifications, last_seen, notifications_token }) =>
        ({ notifications, last_seen, notifications_token } as INotificationsStore),
    },
  ),
);
