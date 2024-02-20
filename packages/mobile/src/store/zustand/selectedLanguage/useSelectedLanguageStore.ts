import { create } from 'zustand';
import { ISelectedLanguageStore } from '$store/zustand/selectedLanguage/types';
import { createJSONStorage, persist } from 'zustand/esm/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState: Omit<ISelectedLanguageStore, 'actions'> = {
  selectedLanguage: 'system',
};

/*
  In-app language selector for old Androids that not support per-app preferences (< Android 13)
  Learn more: https://developer.android.com/guide/topics/resources/app-languages
 */
export const useSelectedLanguageStore = create(
  persist<ISelectedLanguageStore>(
    (set) => ({
      ...initialState,
      actions: {
        setSelectedLanguage: async (language) => {
          set({ selectedLanguage: language });
        },
      },
    }),
    {
      name: 'in-app-language',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ selectedLanguage }) =>
        ({ selectedLanguage } as ISelectedLanguageStore),
    },
  ),
);
