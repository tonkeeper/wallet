export interface IPrivacyStore {
  hiddenAmounts: boolean;
  animation: boolean;
  actions: {
    toggleHiddenAmounts: () => void;
    showAmounts: () => void;
    hideAmounts: () => void;
  };
}
