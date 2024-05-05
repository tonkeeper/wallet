import { useStakingRefreshControl } from '$hooks/useStakingRefreshControl';
import { useNavigation } from '@tonkeeper/router';
import { MainStackRouteNames, openDAppBrowser } from '$navigation';
import { StakingListCell } from '$shared/components';
import { FlashCountKeys, useFlashCount, useNotificationsStore } from '$store';
import { Button, Icon, ScrollHandler, Spacer, Text } from '$uikit';
import { List } from '$uikit/List/old/List';
import { getImplementationIcon, getPoolIcon } from '$utils/staking';
import { formatter } from '$utils/formatter';
import BigNumber from 'bignumber.js';
import React, { FC, useCallback, useMemo } from 'react';
import { RefreshControl } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as S from './Staking.style';
import { logEvent } from '@amplitude/analytics-browser';
import { t } from '@tonkeeper/shared/i18n';
import { Address } from '@tonkeeper/shared/Address';
import { PoolImplementationType } from '@tonkeeper/core/src/TonAPI';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { Flash, Screen } from '@tonkeeper/uikit';
import { Ton } from '$libs/Ton';
import { useBalancesState, useJettons, useStakingState } from '@tonkeeper/shared/hooks';
import { StakingManager, StakingProvider } from '$wallet/managers/StakingManager';
import { config } from '$config';
import { RestakeBanner } from '../../components/RestakeBanner/RestakeBanner';
import { shallow } from 'zustand/shallow';
import { tk } from '$wallet';

interface Props {}

export const Staking: FC<Props> = () => {
  const nav = useNavigation();

  const { bottom: bottomInset } = useSafeAreaInsets();

  const providers = useStakingState((s) => s.providers);
  const pools = useStakingState((s) => s.pools);
  const stakingInfo = useStakingState((s) => s.stakingInfo);
  const highestApyPool = useStakingState((s) => s.highestApyPool);

  const rawAddress = tk.wallet.address.ton.raw ?? '';
  const notificationsStore = useNotificationsStore(
    (state) => state.wallets[rawAddress],
    shallow,
  );

  const [flashShownCount] = useFlashCount(FlashCountKeys.Staking);

  const { jettonBalances } = useJettons();
  const tonBalance = useBalancesState((s) => s.ton);

  const poolsList = useMemo(() => {
    return pools.map((pool) => {
      const stakingJetton = jettonBalances.find(
        (item) => Address.parse(item.jettonAddress).toRaw() === pool.liquid_jetton_master,
      );

      const balance = stakingJetton
        ? new BigNumber(stakingJetton.balance)
        : StakingManager.calculatePoolBalance(pool, stakingInfo);

      const pendingWithdrawal = stakingInfo[pool.address]?.pending_withdraw;

      return {
        ...pool,
        stakingJetton,
        isWithdrawal: balance.isEqualTo(0) && !!pendingWithdrawal,
        balance: balance.isGreaterThan(0)
          ? balance.toString()
          : pendingWithdrawal
          ? Ton.fromNano(pendingWithdrawal)
          : undefined,
      };
    });
  }, [jettonBalances, pools, stakingInfo]);

  const activePools = useMemo(
    () => poolsList.filter((pool) => !!pool.balance || pool.isWithdrawal),
    [poolsList],
  );

  const hasActivePools = activePools.length > 0;

  const data = useMemo(() => {
    const activeList: StakingProvider[] = [];
    const recommendedList: StakingProvider[] = [];
    const otherList: StakingProvider[] = [];

    for (const item of providers) {
      const bn = new BigNumber(formatter.fromNano(item.minStake));
      const minStake = bn.isLessThan('1000')
        ? formatter.format(bn.toFixed(0), { decimals: 0 })
        : `${bn.dividedBy('1000').toFixed(0)}K`;

      const provider = {
        ...item,
        description: t('staking.staking_desc', {
          maxApy: item.maxApy.toFixed(2),
          minStake: minStake,
        }),
      };

      const providerPools = poolsList.filter(
        (pool) => pool.implementation === provider.id,
      );

      const providerActivePools = providerPools.filter((pool) => !!pool.balance);

      if (providerPools.length === providerActivePools.length) {
        activeList.push(provider);
      } else if (provider.id === PoolImplementationType.LiquidTF) {
        recommendedList.push(provider);
      } else {
        otherList.push(provider);
      }
    }

    return { activeList, recommendedList, otherList };
  }, [poolsList, providers]);

  const refreshControl = useStakingRefreshControl();

  const handleProviderPress = useCallback(
    (providerId: string) => {
      const providerPools = pools.filter((pool) => pool.implementation === providerId);

      if (providerPools.length === 1) {
        const { address: poolAddress, name: poolName } = providerPools[0];
        logEvent('pool_open', { poolName, poolAddress });
        nav.push(MainStackRouteNames.StakingPoolDetails, {
          poolAddress: providerPools[0].address,
        });
      } else {
        nav.push(MainStackRouteNames.StakingPools, { providerId });
      }
    },
    [nav, pools],
  );

  const handlePoolPress = useCallback(
    (poolAddress: string, poolName: string) => {
      logEvent('pool_open', { poolName, poolAddress });
      nav.push(MainStackRouteNames.StakingPoolDetails, { poolAddress });
    },
    [nav],
  );

  const handleLearnMorePress = useCallback(() => {
    openDAppBrowser(config.get('stakingInfoUrl'));
  }, []);

  const otherPoolsEstimation = useMemo(() => {
    const otherPools = activePools.filter(
      (pool) => pool.implementation !== PoolImplementationType.LiquidTF,
    );

    return otherPools.reduce(
      (acc, pool) => {
        return {
          balance: new BigNumber(acc.balance)
            .plus(pool.balance || '0')
            .decimalPlaces(Decimals[CryptoCurrencies.Ton])
            .toString(),
          estimatedProfit: new BigNumber(pool.balance || '0')
            .multipliedBy(new BigNumber(pool.apy).dividedBy(100))
            .plus(acc.estimatedProfit)
            .decimalPlaces(Decimals[CryptoCurrencies.Ton])
            .toString(),
        };
      },
      { balance: '0', estimatedProfit: '0' },
    );
  }, [activePools]);

  const getEstimateProfitMessage = useCallback(
    (provider: StakingProvider) => {
      if (new BigNumber(otherPoolsEstimation.balance).isGreaterThan(0)) {
        const estimatedProfit = new BigNumber(otherPoolsEstimation.balance).multipliedBy(
          new BigNumber(provider.maxApy).dividedBy(100),
        );

        const profitDiff = estimatedProfit.minus(otherPoolsEstimation.estimatedProfit);

        if (profitDiff.isGreaterThan(0)) {
          return t('staking.estimated_profit_compare', {
            amount: formatter.format(profitDiff),
          });
        }
      }

      const balance = new BigNumber(tonBalance);

      if (balance.isGreaterThanOrEqualTo(10)) {
        const profit = balance.multipliedBy(
          new BigNumber(provider.maxApy).dividedBy(100),
        );

        return t('staking.estimated_profit', {
          amount: formatter.format(profit),
        });
      }
    },
    [otherPoolsEstimation, tonBalance],
  );

  return (
    <Screen>
      <Screen.Header
        title={hasActivePools ? t('staking.title') : ' '}
        rightContent={
          hasActivePools ? (
            <Button
              onPress={handleLearnMorePress}
              size="navbar_icon"
              mode="secondary"
              before={<Icon name="ic-information-circle-16" color="foregroundPrimary" />}
            />
          ) : null
        }
      />
      <Screen.ScrollView
        refreshControl={<RefreshControl {...refreshControl} />}
        showsVerticalScrollIndicator={false}
      >
        <S.Content bottomInset={bottomInset}>
          {notificationsStore?.showRestakeBanner &&
            notificationsStore?.stakingAddressToMigrateFrom && (
              <>
                <RestakeBanner
                  bypassUnstakeStep={notificationsStore?.bypassUnstakeStep}
                  migrateFrom={notificationsStore?.stakingAddressToMigrateFrom}
                  poolsList={poolsList}
                />
                <Spacer y={16} />
              </>
            )}
          {!hasActivePools ? (
            <S.LargeTitleContainer>
              <Text variant="h2">{t('staking.title_large')}</Text>
              <Spacer y={4} />
              <Text textAlign="center" color="textSecondary" variant="body2">
                {t('staking.desc_large')}{' '}
                <Text
                  color="accentPrimary"
                  variant="body2"
                  onPress={handleLearnMorePress}
                  suppressHighlighting
                >
                  {t('staking.learn_more')}
                </Text>
              </Text>
              <Spacer y={32} />
            </S.LargeTitleContainer>
          ) : null}
          {hasActivePools ? (
            <>
              <S.TitleContainer>
                <Text variant="h3">{t('staking.active')}</Text>
              </S.TitleContainer>
              <List separator={false}>
                {activePools.map((pool, index) => (
                  <StakingListCell
                    key={pool.address}
                    id={pool.address}
                    name={pool.name}
                    balance={pool.balance}
                    isWithdrawal={pool.isWithdrawal}
                    stakingJetton={pool.stakingJetton}
                    description={t('staking.staking_pool_desc', {
                      apy: pool.apy.toFixed(2),
                    })}
                    separator={index < activePools.length - 1}
                    iconSource={getPoolIcon(pool)}
                    onPress={handlePoolPress}
                  />
                ))}
              </List>
              <Spacer y={16} />
            </>
          ) : null}
          {hasActivePools ? (
            <S.TitleContainer>
              <Text variant="h3">{t('staking.other')}</Text>
            </S.TitleContainer>
          ) : null}
          {data.recommendedList.length > 0 ? (
            <>
              <List separator={false}>
                {data.recommendedList.map((provider, index) => (
                  <Flash key={provider.id} disabled={flashShownCount >= 2}>
                    <StakingListCell
                      id={provider.id}
                      name={provider.name}
                      iconSource={getImplementationIcon(provider.id)}
                      description={provider.description}
                      highestApy={
                        highestApyPool && highestApyPool.implementation === provider.id
                      }
                      message={getEstimateProfitMessage(provider)}
                      separator={index < data.recommendedList.length - 1}
                      onPress={handleProviderPress}
                    />
                  </Flash>
                ))}
              </List>
              <Spacer y={16} />
            </>
          ) : null}
          {data.otherList.length > 0 ? (
            <>
              <List separator={false}>
                {data.otherList.map((provider, index) => (
                  <StakingListCell
                    key={provider.id}
                    id={provider.id}
                    name={provider.name}
                    iconSource={getImplementationIcon(provider.id)}
                    description={provider.description}
                    highestApy={
                      highestApyPool && highestApyPool.implementation === provider.id
                    }
                    separator={index < data.otherList.length - 1}
                    onPress={handleProviderPress}
                  />
                ))}
              </List>
              <Spacer y={16} />
            </>
          ) : null}
        </S.Content>
      </Screen.ScrollView>
    </Screen>
  );
};
