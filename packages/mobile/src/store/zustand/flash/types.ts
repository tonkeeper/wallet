export enum FlashCountKeys {
  StakingWidget = 'StakingWidget',
  Staking = 'Staking',
  MultiWallet = 'MultiWallet',
}

export type FlashCountState = {
  flashCounts: {
    [key in FlashCountKeys]: number;
  };
};

type FlashCountActions = {
  increaseFlashCount: (key: FlashCountKeys, count?: number) => void;
};

export type IFlashCountStore = FlashCountState & FlashCountActions;
