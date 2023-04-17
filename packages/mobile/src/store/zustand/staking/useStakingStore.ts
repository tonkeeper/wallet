import { KNOWN_STAKING_IMPLEMENTATIONS } from '$shared/constants';
import { store } from '$store';
import { i18n } from '$translation';
import { calculatePoolBalance } from '$utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Configuration, StakingApi } from '@tonkeeper/core';
import BigNumber from 'bignumber.js';
import TonWeb from 'tonweb';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IStakingStore, StakingApiStatus, StakingInfo, StakingProvider } from './types';

const getStakingApi = () => {
  return new StakingApi(
    new Configuration({
      basePath: 'https://tonapi.io', // TODO: remove that hardcode when staking API will be available on tonkeeper endpoint
      headers: {
        'Accept-Language': i18n.locale,
      },
    }),
  );
};

const initialState: Omit<IStakingStore, 'actions'> = {
  status: StakingApiStatus.Idle,
  stakingInfo: {},
  pools: [],
  providers: [],
  maxApy: null,
  stakingBalance: '0',
};

export const useStakingStore = create(
  persist<IStakingStore>(
    (set, getState) => ({
      ...initialState,
      actions: {
        fetchPools: async (silent) => {
          const { status } = getState();

          if (status !== StakingApiStatus.Idle) {
            if (status === StakingApiStatus.BackgroundFetching && !silent) {
              set({ status: StakingApiStatus.Refreshing });
            }

            return;
          }

          try {
            set({
              status: silent
                ? StakingApiStatus.BackgroundFetching
                : StakingApiStatus.Refreshing,
            });

            const address = store.getState().wallet?.address?.ton;

            const rawAddress = address
              ? new TonWeb.utils.Address(address).toString(false, true, true)
              : undefined;

            const [{ pools: rawPools, implementations }, { pools: poolsByNominators }] =
              await Promise.all([
                getStakingApi().stakingPools({
                  availableFor: rawAddress,
                  acceptLanguage: i18n.locale,
                }),
                getStakingApi().poolsByNominators({
                  accountId: rawAddress!,
                }),
              ]);

            const pools = rawPools
              .filter(
                (pool) =>
                  !!pool.name &&
                  pool.maxNominators > pool.currentNominators &&
                  pool.implementation === 'whales',
              )
              .sort((a, b) => {
                if (a.apy === b.apy) {
                  return a.cycleStart > b.cycleStart ? 1 : -1;
                }

                return a.apy > b.apy ? 1 : -1;
              });

            const providers = Object.keys(implementations)
              .filter((id) => pools.some((pool) => pool.implementation === id))
              .sort((a, b) => {
                const indexA = KNOWN_STAKING_IMPLEMENTATIONS.indexOf(a);
                const indexB = KNOWN_STAKING_IMPLEMENTATIONS.indexOf(b);

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
                  ...implementationPools.map((pool) => pool.minStake),
                );

                return { id, maxApy, minStake, ...implementations[id] };
              });

            const maxApy = Math.max(...pools.map((pool) => pool.apy));

            const stakingInfo = poolsByNominators.reduce<StakingInfo>(
              (acc, cur) => ({ ...acc, [cur.pool]: cur }),
              {},
            );

            const stakingBalance = pools.reduce((total, pool) => {
              return total.plus(calculatePoolBalance(pool, stakingInfo));
            }, new BigNumber('0'));

            if (address !== store.getState().wallet?.address?.ton) {
              return;
            }

            set({
              pools: pools.sort((a, b) => b.apy - a.apy),
              providers,
              maxApy,
              stakingInfo,
              stakingBalance: stakingBalance.toString(),
            });
          } catch {
          } finally {
            set({ status: StakingApiStatus.Idle });
          }
        },
        reset: () =>
          set({ stakingInfo: {}, stakingBalance: '0', status: StakingApiStatus.Idle }),
      },
    }),
    {
      name: 'staking',
      getStorage: () => AsyncStorage,
      partialize: ({ pools, providers, stakingInfo, maxApy, stakingBalance }) =>
        ({ pools, providers, stakingInfo, maxApy, stakingBalance } as IStakingStore),
    },
  ),
);
