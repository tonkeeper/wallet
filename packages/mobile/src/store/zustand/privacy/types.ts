export interface IPrivacyStore {
  hiddenAmounts: boolean;
  actions: {
    toggleHiddenAmounts: () => void;
  };
}
