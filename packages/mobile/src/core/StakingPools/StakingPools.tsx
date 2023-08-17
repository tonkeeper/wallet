import { useStakingRefreshControl } from '$hooks/useStakingRefreshControl';
import { useNavigation } from '@tonkeeper/router';
import { Ton } from '$libs/Ton';
import { MainStackRouteNames } from '$navigation';
import { MainStackParamList } from '$navigation/MainStack';
import { StakingListCell, StakingWarning } from '$shared/components';
import {
  getStakingPoolsByProvider,
  getStakingProviderById,
  useStakingStore,
} from '$store';
import { ScrollHandler, Spacer } from '$uikit';
import { List } from '$uikit/List/old/List';
import { calculatePoolBalance, getPoolIcon } from '$utils/staking';
import { RouteProp } from '@react-navigation/native';
import BigNumber from 'bignumber.js';
import React, { FC, useCallback, useMemo } from 'react';
import { RefreshControl } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shallow } from 'zustand/shallow';
import * as S from './StakingPools.style';
import { logEvent } from '@amplitude/analytics-browser';
import { useSelector } from 'react-redux';
import { jettonsBalancesSelector } from '$store/jettons';
import { t } from '@tonkeeper/shared/i18n';
import { Address } from '@tonkeeper/core';

interface Props {
  route: RouteProp<MainStackParamList, MainStackRouteNames.StakingPools>;
}

export const StakingPools: FC<Props> = (props) => {
  const {
    route: {
      params: { providerId },
    },
  } = props;

  const provider = useStakingStore((s) => getStakingProviderById(s, providerId), shallow);
  const pools = useStakingStore((s) => getStakingPoolsByProvider(s, providerId), shallow);
  const stakingInfo = useStakingStore((s) => s.stakingInfo, shallow);

  const jettonBalances = useSelector(jettonsBalancesSelector);

  const nav = useNavigation();
  const { bottom: bottomInset } = useSafeAreaInsets();

  const refreshControl = useStakingRefreshControl();

  const list = useMemo(() => {
    return pools.map((pool) => {
      const stakingJetton = jettonBalances.find(
        (item) => Address(item.jettonAddress).toRaw() === pool.liquidJettonMaster,
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

  const handlePoolPress = useCallback(
    (poolAddress: string, poolName: string) => {
      logEvent('pool_open', { poolName, poolAddress });
      nav.push(MainStackRouteNames.StakingPoolDetails, { poolAddress });
    },
    [nav],
  );

  return (
    <S.Wrap>
      <ScrollHandler isLargeNavBar={false} navBarTitle={provider.name}>
        <Animated.ScrollView
          refreshControl={<RefreshControl {...refreshControl} />}
          showsVerticalScrollIndicator={false}
        >
          <S.Content bottomInset={bottomInset}>
            {provider.url ? (
              <>
                <StakingWarning provider={provider} />
                <Spacer y={16} />
              </>
            ) : null}
            <List separator={false}>
              {list.map((pool, index) => (
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
          </S.Content>
        </Animated.ScrollView>
      </ScrollHandler>
    </S.Wrap>
  );
};
