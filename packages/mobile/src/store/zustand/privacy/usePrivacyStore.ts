import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IPrivacyStore } from './types';

const initialState: Omit<IPrivacyStore, 'actions'> = {
  hiddenAmounts: false,
};

export const usePrivacyStore = create(
  persist<IPrivacyStore>(
    (set) => ({
      ...initialState,
      actions: {
        toggleHiddenAmounts: () => {
          set(({ hiddenAmounts }) => ({ hiddenAmounts: !hiddenAmounts }));
        },
      },
    }),
    {
      name: 'privacy',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hiddenAmounts }) => ({ hiddenAmounts } as IPrivacyStore),
    },
  ),
);
