import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IBrowserStore, SearchEngine } from './types';

const initialState: Omit<IBrowserStore, 'actions'> = {
  searchEngine: SearchEngine.DuckDuckGo,
};

export const useBrowserStore = create(
  persist<IBrowserStore>(
    (set) => ({
      ...initialState,
      actions: {
        setSearchEngine: (searchEngine) => {
          set({ searchEngine });
        },
      },
    }),
    {
      name: 'browser',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ searchEngine }) => ({ searchEngine } as IBrowserStore),
    },
  ),
);
