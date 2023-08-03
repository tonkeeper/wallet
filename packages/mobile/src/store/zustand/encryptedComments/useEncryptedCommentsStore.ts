import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IEcryptedCommentsStore } from './types';

const initialState: Omit<IEcryptedCommentsStore, 'actions'> = {
  decryptedComments: {},
};

export const useEncryptedCommentsStore = create(
  persist<IEcryptedCommentsStore>(
    (set, getState) => ({
      ...initialState,
      actions: {
        saveDecryptedComment: (id, comment) => {
          const decryptedComments = getState().decryptedComments;

          decryptedComments[id] = comment;

          set({ decryptedComments });
        },
      },
    }),
    {
      name: 'encryptedComments21dfde2eddde336',
      getStorage: () => AsyncStorage,
      partialize: ({ decryptedComments }) => ({} as IEcryptedCommentsStore),
    },
  ),
);
