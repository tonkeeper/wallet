import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ITokenApprovalStore, TokenApprovalStatus, TokenApprovalType } from './types';
import { Address } from '$libs/Ton';

const initialState: Omit<ITokenApprovalStore, 'actions'> = {
  tokens: {},
  hasWatchedCollectiblesTab: false,
};

export const useTokenApprovalStore = create(
  persist<ITokenApprovalStore>(
    (set, getState) => ({
      ...initialState,
      actions: {
        removeTokenStatus: (address: string) => {
          const { tokens } = getState();
          const rawAddress = new Address(address).format({ raw: true });
          if (tokens[rawAddress]) {
            delete tokens[rawAddress];
            set({ tokens });
          }
        },
        setHasWatchedCollectiblesTab: (hasWatchedCollectiblesTab: boolean) => {
          set({ hasWatchedCollectiblesTab });
        },
        updateTokenStatus: (
          address: string,
          status: TokenApprovalStatus,
          type: TokenApprovalType,
        ) => {
          const { tokens } = getState();
          const rawAddress = new Address(address).format({ raw: true });
          const token = { ...tokens[rawAddress] };

          if (token) {
            token.current = status;
            token.updated_at = Date.now();

            set({ tokens: { ...tokens, [rawAddress]: token } });
          } else {
            set({
              tokens: {
                ...tokens,
                [rawAddress]: {
                  type,
                  current: status,
                  updated_at: Date.now(),
                  approved_meta_revision: 0,
                },
              },
            });
          }
        },
      },
    }),
    {
      name: 'tokenApproval',
      getStorage: () => AsyncStorage,
      partialize: ({ tokens, hasWatchedCollectiblesTab }) =>
        ({ tokens, hasWatchedCollectiblesTab } as ITokenApprovalStore),
      version: 2,
      migrate: (persistedState) => {
        const newState = persistedState as any;
        if (!newState?.tokens) {
          return newState;
        }
        newState.tokens = Object.entries(newState.tokens).reduce((acc, [key, value]) => {
          const newKey = new Address(key).format({ raw: true });
          acc[newKey] = value;
          return acc;
        }, {});
        return newState;
      },
    },
  ),
);
