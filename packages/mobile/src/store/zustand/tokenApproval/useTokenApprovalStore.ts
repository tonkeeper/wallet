import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ITokenApprovalStore, TokenApprovalStatus, TokenApprovalType } from './types';

const initialState: Omit<ITokenApprovalStore, 'actions'> = {
  tokens: {},
};

export const useTokenApprovalStore = create(
  persist<ITokenApprovalStore>(
    (set, getState) => ({
      ...initialState,
      actions: {
        updateTokenStatus: (
          address: string,
          status: TokenApprovalStatus,
          type: TokenApprovalType,
        ) => {
          const { tokens } = getState();
          const token = { ...tokens[address] };

          if (token) {
            token.current = status;
            token.updated_at = Date.now();

            set({ tokens: { ...tokens, [address]: token } });
          } else {
            set({
              tokens: {
                ...tokens,
                [address]: {
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
      partialize: ({ tokens }) => ({ tokens } as ITokenApprovalStore),
    },
  ),
);
