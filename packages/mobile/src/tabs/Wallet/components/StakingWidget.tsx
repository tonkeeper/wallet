import { useStakingStatuses } from '$hooks/useStakingStatuses';
import { MainStackRouteNames } from '$navigation';
import { StakingListCell } from '$shared/components';
import { View } from '$uikit';
import { List } from '$uikit/List/old/List';
import React, { FC, memo, useCallback, useEffect } from 'react';
import { useNavigation } from '@tonkeeper/router';
import { Steezy } from '$styles';
import { useStakingStore } from '$store';
import { StakingWidgetStatus } from './StakingWidgetStatus';
import { logEvent } from '@amplitude/analytics-browser';
import { t } from '@tonkeeper/shared/i18n';
import { Flash } from '@tonkeeper/uikit';

const StakingWidgetComponent: FC = () => {
  const nav = useNavigation();

  const highestApyPool = useStakingStore((s) => s.highestApyPool);
  const flashShownCount = useStakingStore((s) => s.mainFlashShownCount);

  const stakingInfo = useStakingStatuses();

  const handleStakingPress = useCallback(() => {
    logEvent('staking_open');
    nav.push(MainStackRouteNames.Staking);
  }, [nav]);

  useEffect(() => {
    const timerId = setTimeout(
      () => useStakingStore.getState().actions.increaseMainFlashShownCount(),
      1000,
    );

    return () => {
      clearTimeout(timerId);
    };
  }, []);

  const staked = stakingInfo.length > 0;

  const apyDescription = highestApyPool
    ? t('staking.widget_desc', {
        apy: highestApyPool.apy.toFixed(2),
      })
    : '';

  return (
    <View style={styles.container}>
      <List style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }} separator={false}>
        {stakingInfo.map((item) => (
          <StakingWidgetStatus
            key={item.pool.address}
            poolStakingInfo={item.info}
            pool={item.pool}
          />
        ))}
        <Flash disabled={flashShownCount >= 2}>
          <StakingListCell
            isWidget={!staked}
            id="staking"
            name={t('staking.widget_title')}
            description={staked ? t('staking.widget_staking_options') : apyDescription}
            onPress={handleStakingPress}
          />
        </Flash>
      </List>
    </View>
  );
};

export const StakingWidget = memo(StakingWidgetComponent);

const styles = Steezy.create({
  container: {
    // paddingHorizontal: 16,
    // paddingTop: 32,
  },
});
