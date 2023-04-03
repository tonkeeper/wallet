import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DevFeature, IDevFeaturesToggleStore } from './types';

const initialState: Omit<IDevFeaturesToggleStore, 'actions'> = {
  devFeatures: {
    [DevFeature.UseHttpProtocol]: false,
  },
  devLanguage: null,
};

export const useDevFeaturesToggle = create(
  persist<IDevFeaturesToggleStore>(
    (set) => ({
      ...initialState,
      actions: {
        toggleFeature: async (name: DevFeature) => {
          set((state) => {
            const devFeatures = state.devFeatures;
            devFeatures[name] = !devFeatures[name];

            return { devFeatures };
          });
        },
        setDevLanguage: async (language: string) => {
          set(() => {
            const devLanguage = language === 'auto' ? null : language;
            return { devLanguage };
          });
        }
      },
    }),
    {
      name: 'devFeaturesToggle',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ devFeatures, devLanguage }) => ({ devFeatures, devLanguage } as IDevFeaturesToggleStore),
    },
  ),
);
