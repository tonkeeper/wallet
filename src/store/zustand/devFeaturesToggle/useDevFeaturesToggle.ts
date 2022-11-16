import AsyncStorage from '@react-native-async-storage/async-storage';
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { DevFeature, IDevFeaturesToggleStore } from './types';

const initialState: Omit<IDevFeaturesToggleStore, 'actions'> = {
  devFeatures: {
    [DevFeature.TonConnectV2]: false,
  },
};

export const useDevFeaturesToggle = create(
  persist<IDevFeaturesToggleStore>(
    (set) => ({
      ...initialState,
      actions: {
        toogleFeature: async (name: DevFeature) => {
          set((state) => {
            const devFeatures = state.devFeatures;
            devFeatures[name] = !devFeatures[name];

            return { devFeatures };
          });
        },
      },
    }),
    {
      name: 'devFeaturesToggle',
      getStorage: () => AsyncStorage,
      partialize: ({ devFeatures }) => ({ devFeatures } as IDevFeaturesToggleStore),
    },
  ),
);
