import {
  AccountStakingInfo,
  PoolImplementationType,
  PoolInfo,
  TonAPI,
} from '@tonkeeper/core/src/TonAPI';
import { Storage } from '@tonkeeper/core/src/declarations/Storage';
import { TonRawAddress } from '../WalletTypes';
import { State } from '@tonkeeper/core/src/utils/State';
import { JettonMetadata } from '../models/JettonBalanceModel';
import { JettonsManager } from './JettonsManager';
import BigNumber from 'bignumber.js';
import { AmountFormatter } from '@tonkeeper/core/src/utils/AmountFormatter';
import { isEqual } from 'lodash';

export interface StakingProvider {
  id: PoolImplementationType;
  name: string;
  description: string;
  url: string;
  maxApy: number;
  minStake: number;
  socials: string[];
}

export type StakingInfo = Record<AccountStakingInfo['pool'], AccountStakingInfo>;

export enum StakingApiStatus {
  BackgroundFetching = 'BackgroundFetching',
  Refreshing = 'Refreshing',
  Idle = 'Idle',
}

export type StakingState = {
  status: StakingApiStatus;
  pools: PoolInfo[];
  highestApyPool: PoolInfo | null;
  providers: StakingProvider[];
  stakingInfo: StakingInfo;
  stakingJettons: Record<string, JettonMetadata>;
  stakingJettonsUpdatedAt: number;
  stakingBalance: string;
};

export class StakingManager {
  static readonly KNOWN_STAKING_IMPLEMENTATIONS = [
    PoolImplementationType.Whales,
    PoolImplementationType.Tf,
    PoolImplementationType.LiquidTF,
  ];

  static readonly INITIAL_STATE: StakingState = {
    status: StakingApiStatus.Idle,
    stakingInfo: {},
    stakingJettons: {},
    stakingJettonsUpdatedAt: 0,
    pools: [],
    providers: [],
    highestApyPool: null,
    stakingBalance: '0',
  };

  static calculatePoolBalance(pool: PoolInfo, stakingInfo: StakingInfo) {
    const amount = new BigNumber(
      AmountFormatter.fromNanoStatic(stakingInfo[pool.address]?.amount || '0'),
    );
    const pendingDeposit = new BigNumber(
      AmountFormatter.fromNanoStatic(stakingInfo[pool.address]?.pending_deposit || '0'),
    );
    const pendingWithdraw = new BigNumber(
      AmountFormatter.fromNanoStatic(stakingInfo[pool.address]?.pending_withdraw || '0'),
    );
    const readyWithdraw = new BigNumber(
      AmountFormatter.fromNanoStatic(stakingInfo[pool.address]?.ready_withdraw || '0'),
    );
    const balance = amount
      .plus(pendingDeposit)
      .plus(readyWithdraw)
      .plus(
        pool.implementation === PoolImplementationType.LiquidTF ? pendingWithdraw : 0,
      );

    return balance;
  }

  public state = new State<StakingState>(StakingManager.INITIAL_STATE);

  constructor(
    private persistPath: string,
    private tonRawAddress: TonRawAddress,
    private jettons: JettonsManager,
    private tonapi: TonAPI,
    private storage: Storage,
  ) {
    this.state.persist({
      partialize: ({ status: _status, ...state }) => state,
      storage: this.storage,
      key: `${this.persistPath}/staking`,
    });
  }

  public async load(silent?: boolean, updateIfBalanceSame = true) {
    const { status } = this.state.data;

    if (status !== StakingApiStatus.Idle) {
      if (status === StakingApiStatus.BackgroundFetching && !silent) {
        this.state.set({ status: StakingApiStatus.Refreshing });
      }

      return;
    }

    try {
      this.state.set({
        status: silent
          ? StakingApiStatus.BackgroundFetching
          : StakingApiStatus.Refreshing,
      });

      const [poolsResponse, nominatorsResponse] = await Promise.allSettled([
        this.tonapi.staking.getStakingPools({
          available_for: this.tonRawAddress,
          include_unverified: false,
        }),
        this.tonapi.staking.getAccountNominatorsPools(this.tonRawAddress),
      ]);

      let pools = this.state.data.pools;

      let nextState: Partial<StakingState> = {};

      // const tonstakersEnabled = !getFlag('disable_tonstakers');

      if (poolsResponse.status === 'fulfilled') {
        const { implementations } = poolsResponse.value;

        pools = poolsResponse.value.pools
          // .filter(
          //   (pool) =>
          //     tonstakersEnabled ||
          //     pool.implementation !== PoolImplementationType.LiquidTF,
          // )
          .map((pool) => {
            if (pool.implementation !== PoolImplementationType.Whales) {
              return pool;
            }

            const cycle_start = pool.cycle_end > 0 ? pool.cycle_end - 36 * 3600 : 0;

            return { ...pool, cycle_start };
          })
          .sort((a, b) => {
            if (a.name.includes('Tonkeeper') && !b.name.includes('Tonkeeper')) {
              return -1;
            }

            if (b.name.includes('Tonkeeper') && !a.name.includes('Tonkeeper')) {
              return 1;
            }

            if (a.name.includes('Tonkeeper') && b.name.includes('Tonkeeper')) {
              return a.name.includes('#1') ? -1 : 1;
            }

            if (a.apy === b.apy) {
              return a.cycle_start > b.cycle_start ? 1 : -1;
            }

            return a.apy > b.apy ? 1 : -1;
          });

        const providers = (Object.keys(implementations) as PoolImplementationType[])
          .filter((id) => pools.some((pool) => pool.implementation === id))
          .sort((a, b) => {
            const indexA = StakingManager.KNOWN_STAKING_IMPLEMENTATIONS.indexOf(a);
            const indexB = StakingManager.KNOWN_STAKING_IMPLEMENTATIONS.indexOf(b);

            if (indexA === -1 && indexB === -1) {
              return 0;
            }

            if (indexA === -1) {
              return 1;
            }

            if (indexB === -1) {
              return -1;
            }

            return indexA > indexB ? 1 : -1;
          })
          .map((id): StakingProvider => {
            const implementationPools = pools.filter(
              (pool) => pool.implementation === id,
            );
            const maxApy = Math.max(...implementationPools.map((pool) => pool.apy));
            const minStake = Math.min(
              ...implementationPools.map((pool) => pool.min_stake),
            );

            return { id, maxApy, minStake, ...implementations[id] };
          });

        const highestApyPool = pools.reduce<PoolInfo | null>((acc, cur) => {
          if (!acc) {
            return cur;
          }

          return cur.apy > acc.apy ? cur : acc;
        }, null);

        await Promise.all(
          pools
            .filter((pool) => pool.liquid_jetton_master)
            .map((pool) => {
              return (async () => {
                if (this.state.data.stakingJettonsUpdatedAt + 3600 * 1000 > Date.now()) {
                  return;
                }

                const [jettonInfo] = await Promise.all([
                  this.tonapi.jettons.getJettonInfo(pool.liquid_jetton_master!),
                  this.jettons.loadRate(pool.liquid_jetton_master!),
                ]);

                this.state.set((state) => ({
                  stakingJettons: {
                    ...state.stakingJettons,
                    [pool.liquid_jetton_master!]: {
                      ...jettonInfo.metadata,
                      decimals: Number(jettonInfo.metadata.decimals),
                    },
                  },
                }));
              })();
            }),
        );

        this.state.set({ stakingJettonsUpdatedAt: Date.now() });

        nextState = {
          ...nextState,
          pools: pools.sort((a, b) => b.apy - a.apy),
          providers,
          highestApyPool,
        };
      }

      if (nominatorsResponse.status === 'fulfilled') {
        const stakingInfo = nominatorsResponse.value.pools.reduce<StakingInfo>(
          (acc, cur) => ({ ...acc, [cur.pool]: cur }),
          {},
        );

        const stakingBalance = pools.reduce((total, pool) => {
          return total.plus(StakingManager.calculatePoolBalance(pool, stakingInfo));
        }, new BigNumber('0'));

        nextState = {
          ...nextState,
          stakingInfo,
          stakingBalance: stakingBalance.toString(),
        };
      }

      if (
        updateIfBalanceSame ||
        !isEqual(nextState.stakingInfo, this.state.data.stakingInfo)
      ) {
        this.state.set({ ...nextState });
      }
    } catch (e) {
      console.log('fetchPools error', e);
    } finally {
      this.state.set({ status: StakingApiStatus.Idle });
    }
  }

  public async reload() {
    await this.load();
  }

  public reset() {
    this.state.set({
      stakingInfo: {},
      stakingBalance: '0',
      status: StakingApiStatus.Idle,
    });
  }

  public async rehydrate() {
    return this.state.rehydrate();
  }
}
