import { JettonBalanceModel } from '$store/models';
import {
  AccountStakingInfo,
  PoolInfo,
  PoolImplementationType,
  JettonMetadata,
} from '@tonkeeper/core/src/TonAPI';

export interface StakingProvider {
  id: PoolImplementationType;
  name: string;
  description: string;
  url: string;
  maxApy: number;
  minStake: number;
  socials: string[];
}

export interface IStakingChartPoint {
  x: number;
  y: number;
}

export type StakingInfo = Record<AccountStakingInfo['pool'], AccountStakingInfo>;

export enum StakingApiStatus {
  BackgroundFetching = 'BackgroundFetching',
  Refreshing = 'Refreshing',
  Idle = 'Idle',
}

export interface IStakingStore {
  status: StakingApiStatus;
  pools: PoolInfo[];
  highestApyPool: PoolInfo | null;
  providers: StakingProvider[];
  stakingInfo: StakingInfo;
  stakingJettons: Record<string, JettonMetadata>;
  stakingJettonsUpdatedAt: number;
  stakingBalance: string;
  chart: IStakingChartPoint[];
  mainFlashShownCount: number;
  stakingFlashShownCount: number;
  actions: {
    fetchPools: (silent?: boolean) => Promise<void>;
    reset: () => void;
    fetchChart: (jetton: JettonBalanceModel) => Promise<void>;
    increaseMainFlashShownCount: () => void;
    increaseStakingFlashShownCount: () => void;
  };
}
