import { KNOWN_STAKING_IMPLEMENTATIONS, getServerConfig } from '$shared/constants';
import { store } from '$store';
import { useDevFeaturesToggle } from '../devFeaturesToggle/useDevFeaturesToggle';
import { DevFeature } from '../devFeaturesToggle/types';
import { calculatePoolBalance } from '$utils/staking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Configuration, StakingApi } from '@tonkeeper/core/src/legacy';
import BigNumber from 'bignumber.js';
import TonWeb from 'tonweb';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IStakingStore, StakingApiStatus, StakingInfo, StakingProvider } from './types';
import { i18n } from '$translation';
import _ from 'lodash';

const getStakingApi = () => {
  return new StakingApi(
    new Configuration({
      basePath: getServerConfig('tonapiIOEndpoint'),
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiV2Key')}`,
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
  isLiquidJettonWarningShown: false,
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

            const [poolsResponse, nominatorsResponse] = await Promise.allSettled([
              getStakingApi().stakingPools({
                availableFor: rawAddress,
                acceptLanguage: i18n.locale,
                includeUnverified: true,
              }),
              getStakingApi().poolsByNominators({
                accountId: rawAddress!,
              }),
            ]);

            let pools = getState().pools;

            let nextState: Partial<IStakingStore> = {};

            const tonstakersEnabled =
              useDevFeaturesToggle.getState().devFeatures[DevFeature.Tonstakers];

            if (poolsResponse.status === 'fulfilled') {
              const { implementations } = poolsResponse.value;

              pools = poolsResponse.value.pools
                .filter((pool) => tonstakersEnabled || pool.implementation !== 'liquidTF')
                .map((pool) => {
                  if (pool.implementation !== 'whales') {
                    return pool;
                  }

                  const cycleStart = pool.cycleEnd > 0 ? pool.cycleEnd - 36 * 3600 : 0;

                  return { ...pool, cycleStart };
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

              nextState = {
                ...nextState,
                pools: pools.sort((a, b) => b.apy - a.apy),
                providers,
                maxApy,
              };
            }

            if (nominatorsResponse.status === 'fulfilled') {
              const stakingInfo = nominatorsResponse.value.pools.reduce<StakingInfo>(
                (acc, cur) => ({ ...acc, [cur.pool]: cur }),
                {},
              );

              const stakingBalance = pools.reduce((total, pool) => {
                return total.plus(calculatePoolBalance(pool, stakingInfo));
              }, new BigNumber('0'));

              nextState = {
                ...nextState,
                stakingInfo,
                stakingBalance: stakingBalance.toString(),
              };
            }

            if (address !== store.getState().wallet?.address?.ton) {
              return;
            }

            if (!silent || !_.isEqual(nextState.stakingInfo, getState().stakingInfo)) {
              set({ ...nextState });
            }
          } catch (e) {
            console.log('fetchPools error', e.response);
          } finally {
            set({ status: StakingApiStatus.Idle });
          }
        },
        reset: () =>
          set({ stakingInfo: {}, stakingBalance: '0', status: StakingApiStatus.Idle }),
        setLiquidJettonWarningShown: (isLiquidJettonWarningShown) =>
          set({ isLiquidJettonWarningShown }),
      },
    }),
    {
      name: 'staking',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({
        pools,
        providers,
        stakingInfo,
        maxApy,
        stakingBalance,
        isLiquidJettonWarningShown,
      }) =>
        ({
          pools,
          providers,
          stakingInfo,
          maxApy,
          stakingBalance,
          isLiquidJettonWarningShown,
        } as IStakingStore),
    },
  ),
);
