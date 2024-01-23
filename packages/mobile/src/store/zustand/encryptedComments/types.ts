export interface IEcryptedCommentsStore {
  decryptedComments: Record<string, string>;
  shouldOpenEncryptedCommentModal: boolean;
  actions: {
    saveDecryptedComment: (id: string, comment: string) => void;
    setShouldOpenEncryptedCommentModal: (value: boolean) => void;
  };
}
