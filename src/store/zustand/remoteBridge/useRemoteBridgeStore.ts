import AsyncStorage from '@react-native-async-storage/async-storage';
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { IRemoteBridgeStore } from './types';

const initialState: Omit<IRemoteBridgeStore, 'setBridgeUrl'> = {
  bridgeUrl: 'https://bridge.tonapi.io/bridge',
};

export const useRemoteBridgeStore = create(
  persist<IRemoteBridgeStore>(
    (set) => ({
      ...initialState,
      setBridgeUrl: (bridgeUrl) => {
        set({ bridgeUrl });
      },
    }),
    {
      name: 'remoteBridge',
      getStorage: () => AsyncStorage,
      partialize: ({ bridgeUrl }) => ({ bridgeUrl } as IRemoteBridgeStore),
    },
  ),
);
