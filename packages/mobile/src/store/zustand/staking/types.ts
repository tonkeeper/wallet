import { AccountStakingInfo, PoolInfo } from '@tonkeeper/core';

export interface StakingProvider {
  id: string;
  name: string;
  description: string;
  url: string;
  maxApy: number;
  minStake: number;
}

export type StakingInfo = Record<AccountStakingInfo['pool'], AccountStakingInfo>;

export enum StakingApiStatus {
  BackgroundFetching = 'BackgroundFetching',
  Refreshing = 'Refreshing',
  Idle = 'Idle',
}

export interface IStakingStore {
  maxApy: number | null;
  status: StakingApiStatus;
  pools: PoolInfo[];
  providers: StakingProvider[];
  stakingInfo: StakingInfo;
  stakingBalance: string;
  isLiquidJettonWarningShown: boolean;
  actions: {
    fetchPools: (silent?: boolean) => Promise<void>;
    reset: () => void;
    setLiquidJettonWarningShown: (value: boolean) => void;
  };
}
