export interface IStakingStore {
  mainFlashShownCount: number;
  stakingFlashShownCount: number;
  actions: {
    increaseMainFlashShownCount: () => void;
    increaseStakingFlashShownCount: () => void;
  };
}
