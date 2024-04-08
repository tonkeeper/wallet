import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IBatteryUIStore } from './types';

const initialState: Omit<IBatteryUIStore, 'actions'> = {
  isViewedBatteryScreen: false,
};

export const useBatteryUIStore = create(
  persist<IBatteryUIStore>(
    (set) => ({
      ...initialState,
      actions: {
        setIsViewedBatteryScreen: (isViewedBatteryScreen) => {
          set({ isViewedBatteryScreen });
        },
      },
    }),
    {
      name: 'battery-ui',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ isViewedBatteryScreen }) =>
        ({ isViewedBatteryScreen } as IBatteryUIStore),
    },
  ),
);
