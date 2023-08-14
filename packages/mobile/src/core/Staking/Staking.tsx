import { useStakingRefreshControl } from '$hooks/useStakingRefreshControl';
import { useNavigation } from '@tonkeeper/router';
import { MainStackRouteNames } from '$navigation';
import { StakingListCell } from '$shared/components';
import { StakingProvider, useStakingStore } from '$store';
import { ScrollHandler, Spacer, Text } from '$uikit';
import { List } from '$uikit/List/old/List';
import { calculatePoolBalance, getImplementationIcon, getPoolIcon } from '$utils/staking';
import { formatter } from '$utils/formatter';
import BigNumber from 'bignumber.js';
import React, { FC, useCallback, useMemo } from 'react';
import { RefreshControl } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shallow } from 'zustand/shallow';
import * as S from './Staking.style';
import { jettonsBalancesSelector } from '$store/jettons';
import { useSelector } from 'react-redux';
import { logEvent } from '@amplitude/analytics-browser';
import { t } from '@tonkeeper/shared/i18n';
import { Address } from '@tonkeeper/shared/Address';
import { Ton } from '$libs/Ton';

interface Props {}

export const Staking: FC<Props> = () => {
  const nav = useNavigation();

  const { bottom: bottomInset } = useSafeAreaInsets();

  const providers = useStakingStore((s) => s.providers, shallow);
  const pools = useStakingStore((s) => s.pools, shallow);
  const stakingInfo = useStakingStore((s) => s.stakingInfo, shallow);

  const jettonBalances = useSelector(jettonsBalancesSelector);

  const poolsList = useMemo(() => {
    return pools.map((pool) => {
      const stakingJetton = jettonBalances.find(
        (item) => Address.parse(item.jettonAddress).toRaw() === pool.liquidJettonMaster,
      );

      const balance = stakingJetton
        ? new BigNumber(stakingJetton.balance)
        : calculatePoolBalance(pool, stakingInfo);

      const pendingWithdrawal = stakingInfo[pool.address]?.pendingWithdraw;

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
      } else if (provider.id === 'liquidTF') {
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

  return (
    <S.Wrap>
      <ScrollHandler isLargeNavBar={false} navBarTitle={t('staking.title')}>
        <Animated.ScrollView
          refreshControl={<RefreshControl {...refreshControl} />}
          showsVerticalScrollIndicator={false}
        >
          <S.Content bottomInset={bottomInset}>
            {activePools.length > 0 ? (
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
                      separator={index < pools.length - 1}
                      iconSource={getPoolIcon(pool)}
                      onPress={handlePoolPress}
                    />
                  ))}
                </List>
                <Spacer y={16} />
              </>
            ) : null}
            {data.recommendedList.length > 0 ? (
              <>
                <S.TitleContainer>
                  <Text variant="h3">{t('staking.recommended')}</Text>
                </S.TitleContainer>
                <List separator={false}>
                  {data.recommendedList.map((provider, index) => (
                    <StakingListCell
                      key={provider.id}
                      id={provider.id}
                      name={provider.name}
                      iconSource={getImplementationIcon(provider.id)}
                      description={provider.description}
                      separator={index < providers.length - 1}
                      onPress={handleProviderPress}
                    />
                  ))}
                </List>
                <Spacer y={16} />
              </>
            ) : null}
            {data.otherList.length > 0 ? (
              <>
                {activePools.length > 0 || data.recommendedList.length > 0 ? (
                  <S.TitleContainer>
                    <Text variant="h3">{t('staking.other')}</Text>
                  </S.TitleContainer>
                ) : null}
                <List separator={false}>
                  {data.otherList.map((provider, index) => (
                    <StakingListCell
                      key={provider.id}
                      id={provider.id}
                      name={provider.name}
                      iconSource={getImplementationIcon(provider.id)}
                      description={provider.description}
                      separator={index < providers.length - 1}
                      onPress={handleProviderPress}
                    />
                  ))}
                </List>
                <Spacer y={16} />
              </>
            ) : null}
          </S.Content>
        </Animated.ScrollView>
      </ScrollHandler>
    </S.Wrap>
  );
};
