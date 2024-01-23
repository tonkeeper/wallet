import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IEcryptedCommentsStore } from './types';

const initialState: Omit<IEcryptedCommentsStore, 'actions'> = {
  decryptedComments: {},
  shouldOpenEncryptedCommentModal: true,
};

export const useEncryptedCommentsStore = create(
  persist<IEcryptedCommentsStore>(
    (set, getState) => ({
      ...initialState,
      actions: {
        setShouldOpenEncryptedCommentModal: (value: boolean) => {
          set({ shouldOpenEncryptedCommentModal: value });
        },
        saveDecryptedComment: (id, comment) => {
          const decryptedComments = getState().decryptedComments;

          decryptedComments[id] = comment;

          set({ decryptedComments });
        },
      },
    }),
    {
      name: 'encryptedComments',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState: IEcryptedCommentsStore, version) => {
        if (version < 2) {
          persistedState.shouldOpenEncryptedCommentModal = true;
          return persistedState;
        }
      },
      partialize: ({ decryptedComments, shouldOpenEncryptedCommentModal }) =>
        ({
          decryptedComments,
          shouldOpenEncryptedCommentModal,
        } as IEcryptedCommentsStore),
    },
  ),
);
