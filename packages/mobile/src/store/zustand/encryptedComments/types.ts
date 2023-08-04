export interface IEcryptedCommentsStore {
  decryptedComments: Record<string, string>;
  actions: {
    saveDecryptedComment: (id: string, comment: string) => void;
  };
}
