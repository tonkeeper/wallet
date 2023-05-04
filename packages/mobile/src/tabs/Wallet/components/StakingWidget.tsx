import { useTranslator } from '$hooks';
import { MainStackRouteNames } from '$navigation';
import { StakingListCell } from '$shared/components';
import { List, View } from '$uikit';
import React, { FC, memo, useCallback } from 'react';
import { useNavigation } from '$libs/navigation';
import { Steezy } from '$styles';
import { useStakingStore } from '$store';
import { shallow } from 'zustand/shallow';
import { StakingWidgetStatus } from './StakingWidgetStatus';
import { logEvent } from '@amplitude/analytics-browser';

const StakingWidgetComponent: FC = () => {
  const t = useTranslator();

  const nav = useNavigation();

  const maxApy = useStakingStore((s) => s.maxApy);

  const stakingInfo = useStakingStore(
    (s) =>
      s.pools
        .map((pool) => ({ info: s.stakingInfo[pool.address], pool }))
        .filter(({ info }) => !!info),
    shallow,
  );

  const hasPools = useStakingStore(
    (s) => s.pools.some((pool) => pool.implementation === 'whales'),
    shallow,
  );

  const handleStakingPress = useCallback(() => {
    logEvent('staking_open');
    nav.push(MainStackRouteNames.StakingPools, { providerId: 'whales' });
  }, [nav]);

  if (!hasPools) {
    return null;
  }

  return (
    <View style={styles.container}>
      <List separator={false}>
        {stakingInfo.map((item) => (
          <StakingWidgetStatus
            key={item.pool.address}
            poolStakingInfo={item.info}
            pool={item.pool}
          />
        ))}
        <StakingListCell
          isWidget={true}
          id="staking"
          name={t('staking.title')}
          description={
            maxApy
              ? t('staking.widget_desc', {
                  apy: maxApy.toFixed(2),
                })
              : ''
          }
          onPress={handleStakingPress}
        />
      </List>
    </View>
  );
};

export const StakingWidget = memo(StakingWidgetComponent);

const styles = Steezy.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 32,
  },
});
