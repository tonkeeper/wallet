import { KNOWN_STAKING_IMPLEMENTATIONS } from '$shared/constants';
import { store } from '$store';
import { calculatePoolBalance } from '$utils/staking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BigNumber from 'bignumber.js';
import TonWeb from 'tonweb';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  IStakingChartPoint,
  IStakingStore,
  StakingApiStatus,
  StakingInfo,
  StakingProvider,
} from './types';
import _ from 'lodash';
import { getFlag } from '$utils/flags';
import { tonapi } from '@tonkeeper/shared/tonkeeper';
import {
  AccountEvent,
  ActionTypeEnum,
  PoolInfo,
  PoolImplementationType,
} from '@tonkeeper/core/src/TonAPI';
import { Address } from '@tonkeeper/core';
import { Ton } from '$libs/Ton';
import { dateToTimestamp, timestampToDateString } from '@tonkeeper/shared/utils/date';
import { useRatesStore } from '../rates';
import { JettonsState } from '$store/jettons/interface';

const initialState: Omit<IStakingStore, 'actions'> = {
  status: StakingApiStatus.Idle,
  stakingInfo: {},
  stakingJettons: {},
  stakingJettonsUpdatedAt: 0,
  pools: [],
  providers: [],
  highestApyPool: null,
  stakingBalance: '0',
  chart: [],
  mainFlashShownCount: 0,
  stakingFlashShownCount: 0,
};

export const useStakingStore = create(
  persist<IStakingStore>(
    (set, getState) => ({
      ...initialState,
      actions: {
        fetchPools: async (silent, updateIfBalanceSame = true) => {
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
              tonapi.staking.getStakingPools({
                available_for: rawAddress,
                include_unverified: false,
              }),
              tonapi.staking.getAccountNominatorsPools(rawAddress!),
            ]);

            let pools = getState().pools;

            let nextState: Partial<IStakingStore> = {};

            const tonstakersEnabled = !getFlag('disable_tonstakers');

            if (poolsResponse.status === 'fulfilled') {
              const { implementations } = poolsResponse.value;

              pools = poolsResponse.value.pools
                .filter(
                  (pool) =>
                    tonstakersEnabled ||
                    pool.implementation !== PoolImplementationType.LiquidTF,
                )
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
                      if (getState().stakingJettonsUpdatedAt + 3600 * 1000 > Date.now()) {
                        return;
                      }

                      const [jettonInfo] = await Promise.all([
                        tonapi.jettons.getJettonInfo(pool.liquid_jetton_master!),
                        useRatesStore
                          .getState()
                          .actions.fetchRate(pool.liquid_jetton_master!),
                      ]);

                      set((state) => ({
                        stakingJettons: {
                          ...state.stakingJettons,
                          [pool.liquid_jetton_master!]: jettonInfo.metadata,
                        },
                      }));
                    })();
                  }),
              );

              set({ stakingJettonsUpdatedAt: Date.now() });

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

            if (
              updateIfBalanceSame ||
              !_.isEqual(nextState.stakingInfo, getState().stakingInfo)
            ) {
              set({ ...nextState });
            }
          } catch (e) {
            console.log('fetchPools error', e);
          } finally {
            set({ status: StakingApiStatus.Idle });
          }
        },
        fetchChart: async (jetton) => {
          const address = Address.parse(store.getState().wallet?.address?.ton).toRaw();

          const startDate = Math.round(Date.now() / 1000 - 30 * 24 * 3600);

          const [jettonHistory, rateChart] = await Promise.all([
            tonapi.accounts.getAccountJettonHistoryById({
              accountId: address,
              jettonId: jetton.jettonAddress,
              start_date: startDate,
              limit: 1000,
            }),
            tonapi.rates.getChartRates({
              token: jetton.jettonAddress,
              start_date: startDate,
            }),
          ]);

          const history = jettonHistory.events.reduce<{
            [key: number]: AccountEvent[];
          }>((acc, cur) => {
            const date = timestampToDateString(cur.timestamp);
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(cur);

            return acc;
          }, {});

          let balance = new BigNumber(jetton.balance);

          const chart: IStakingChartPoint[] = [];

          for (const point of rateChart.points) {
            const [date, rate] = point;

            if (balance.isLessThanOrEqualTo(0)) {
              break;
            }

            chart.unshift({
              x: dateToTimestamp(date),
              y: balance.multipliedBy(rate).toNumber(),
            });

            if (history[date]) {
              for (const historyItem of history[date]) {
                const action = historyItem.actions[0];

                if (action.type === ActionTypeEnum.JettonTransfer) {
                  const amount = new BigNumber(
                    Ton.fromNano(action.JettonTransfer!.amount),
                  );

                  if (action.JettonTransfer!.recipient?.address === address) {
                    balance = balance.minus(amount);
                  } else {
                    balance = balance.plus(amount);
                  }
                } else if (action.type === ActionTypeEnum.JettonMint) {
                  const amount = new BigNumber(Ton.fromNano(action.JettonMint!.amount));

                  balance = balance.minus(amount);
                } else if (action.type === ActionTypeEnum.JettonBurn) {
                  const amount = new BigNumber(Ton.fromNano(action.JettonBurn!.amount));

                  balance = balance.plus(amount);
                }

                if (balance.isLessThanOrEqualTo(0)) {
                  break;
                }
              }
            }
          }

          if (chart.length <= 7) {
            while (chart.length > 0 && chart.length < 7) {
              if (chart[0]) {
                chart.unshift({
                  x: chart[0].x - 3600 * 24,
                  y: 0,
                });
              }
            }
          } else if (chart.length < 14) {
            chart.splice(0, chart.length - 7);
          } else if (chart.length < 30) {
            chart.splice(0, chart.length - 14);
          }

          set({ chart });
        },
        reset: () => {
          set({ stakingInfo: {}, stakingBalance: '0', status: StakingApiStatus.Idle });
        },
        increaseMainFlashShownCount: () => {
          set({ mainFlashShownCount: getState().mainFlashShownCount + 1 });
        },
        increaseStakingFlashShownCount: () => {
          set({ stakingFlashShownCount: getState().stakingFlashShownCount + 1 });
        },
      },
    }),
    {
      name: 'staking_v4',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ status: _status, actions: _actions, ...state }) =>
        state as IStakingStore,
    },
  ),
);
