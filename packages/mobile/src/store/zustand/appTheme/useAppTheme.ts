import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IAppThemeStore, ThemeOptions } from './types';

const initialState: Omit<IAppThemeStore, 'actions'> = {
  selectedTheme: ThemeOptions.Blue,
};

export const useAppThemeStore = create(
  persist<IAppThemeStore>(
    (set) => ({
      ...initialState,
      actions: {
        setSelectedTheme: (selectedTheme) => {
          set({ selectedTheme });
        },
      },
    }),
    {
      name: 'app-theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ selectedTheme }) => ({ selectedTheme } as IAppThemeStore),
    },
  ),
);
