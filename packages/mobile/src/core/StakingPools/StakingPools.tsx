import { useStakingRefreshControl, useTranslator } from '$hooks';
import { useNavigation } from '@tonkeeper/router';
import { Ton } from '$libs/Ton';
import { MainStackRouteNames, openDAppBrowser } from '$navigation';
import { MainStackParamList } from '$navigation/MainStack';
import { StakingListCell } from '$shared/components';
import {
  getStakingPoolsByProvider,
  getStakingProviderById,
  StakingInfo,
  useStakingStore,
} from '$store';
import { Icon, ScrollHandler, Spacer, Text } from '$uikit';
import { List } from '$uikit/List/old/List';
import { calculatePoolBalance, getPoolIcon } from '$utils';
import { RouteProp } from '@react-navigation/native';
import { PoolInfo } from '@tonkeeper/core/src/legacy';
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

const calculateBalance = (pool: PoolInfo, stakingInfo: StakingInfo) => {
  const amount = new BigNumber(Ton.fromNano(stakingInfo[pool.address]?.amount || '0'));
  const pendingDeposit = new BigNumber(
    Ton.fromNano(stakingInfo[pool.address]?.pendingDeposit || '0'),
  );
  const readyWithdraw = new BigNumber(
    Ton.fromNano(stakingInfo[pool.address]?.readyWithdraw || '0'),
  );
  const balance = amount.plus(pendingDeposit).plus(readyWithdraw);

  return balance.isGreaterThan(0) ? balance.toString() : undefined;
};

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

  const t = useTranslator();
  const nav = useNavigation();
  const { bottom: bottomInset } = useSafeAreaInsets();

  const refreshControl = useStakingRefreshControl();

  const list = useMemo(() => {
    return pools.map((pool) => {
      const stakingJetton = jettonBalances.find(
        (item) =>
          Ton.formatAddress(item.jettonAddress, { raw: true }) ===
          pool.liquidJettonMaster,
      );

      const balance = stakingJetton
        ? new BigNumber(stakingJetton.balance)
        : calculatePoolBalance(pool, stakingInfo);

      return {
        ...pool,
        stakingJetton,
        balance: balance.isGreaterThan(0) ? balance.toString() : undefined,
      };
    });
  }, [jettonBalances, pools, stakingInfo]);

  const handleWarningPress = useCallback(() => {
    if (!provider.url) {
      return;
    }

    openDAppBrowser(provider.url);
  }, [provider.url]);

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
                <S.WarningContainer>
                  <S.WarningTouchable
                    background="backgroundQuaternary"
                    onPress={handleWarningPress}
                  >
                    <S.WarningContent>
                      <Text variant="label1">{t('staking.warning.title')}</Text>
                      <Text variant="body2" color="foregroundSecondary">
                        {t('staking.warning.desc')}
                      </Text>
                      <Spacer y={4} />
                      <S.WarningRow>
                        <Text variant="label2">
                          {t('staking.warning.about', { name: provider.name })}
                        </Text>
                        <Spacer x={2} />
                        <S.WarningIcon>
                          <Icon name="ic-chevron-right-12" color="foregroundPrimary" />
                        </S.WarningIcon>
                      </S.WarningRow>
                    </S.WarningContent>
                  </S.WarningTouchable>
                </S.WarningContainer>
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
