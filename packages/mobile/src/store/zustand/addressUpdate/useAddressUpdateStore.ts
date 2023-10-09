import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IAddressUpdateStore } from './types';

const initialState: Omit<IAddressUpdateStore, 'actions'> = {
  dismissed: false,
};

export const useAddressUpdateStore = create(
  persist<IAddressUpdateStore>(
    (set) => ({
      ...initialState,
      actions: {
        dismiss: () => {
          set({ dismissed: true });
        },
      },
    }),
    {
      name: 'addressUpdate',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ dismissed }) => ({ dismissed } as IAddressUpdateStore),
    },
  ),
);
