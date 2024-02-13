import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IStakingStore } from './types';

const initialState: Omit<IStakingStore, 'actions'> = {
  mainFlashShownCount: 0,
  stakingFlashShownCount: 0,
};

export const useStakingUIStore = create(
  persist<IStakingStore>(
    (set, getState) => ({
      ...initialState,
      actions: {
        increaseMainFlashShownCount: () => {
          set({ mainFlashShownCount: getState().mainFlashShownCount + 1 });
        },
        increaseStakingFlashShownCount: () => {
          set({ stakingFlashShownCount: getState().stakingFlashShownCount + 1 });
        },
      },
    }),
    {
      name: 'staking_v4',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ actions: _actions, ...state }) => state as IStakingStore,
    },
  ),
);
