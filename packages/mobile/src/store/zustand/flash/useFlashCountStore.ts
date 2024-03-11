import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { FlashCountKeys, FlashCountState, IFlashCountStore } from './types';

const initialState: FlashCountState = {
  flashCounts: {
    [FlashCountKeys.StakingWidget]: 0,
    [FlashCountKeys.Staking]: 0,
    [FlashCountKeys.MultiWallet]: 0,
  },
};

export const useFlashCountStore = create(
  persist<IFlashCountStore>(
    (set) => ({
      ...initialState,
      increaseFlashCount: (key: string, count?: number) => {
        set((state) => ({
          flashCounts: {
            ...state.flashCounts,
            [key]: count ?? state.flashCounts[key] + 1,
          },
        }));
      },
    }),
    {
      name: 'staking_v4',
      version: 2,
      migrate: (persistedState: any) => {
        if (persistedState.mainFlashShownCount) {
          persistedState.flashCounts[FlashCountKeys.StakingWidget] =
            persistedState.mainFlashShownCount;
          delete persistedState.mainFlashShownCount;
        }
        if (persistedState.stakingFlashShownCount) {
          persistedState.flashCounts[FlashCountKeys.Staking] =
            persistedState.stakingFlashShownCount;
          delete persistedState.stakingFlashShownCount;
        }

        console.log('migrate', persistedState);

        return persistedState as IFlashCountStore;
      },
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ increaseFlashCount: _, ...state }) => state as IFlashCountStore,
    },
  ),
);
