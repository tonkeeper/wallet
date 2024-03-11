import { useStakingStatuses } from '$hooks/useStakingStatuses';
import { MainStackRouteNames } from '$navigation';
import { StakingListCell } from '$shared/components';
import { View } from '$uikit';
import { List } from '$uikit/List/old/List';
import React, { FC, memo, useCallback } from 'react';
import { useNavigation } from '@tonkeeper/router';
import { Steezy } from '$styles';
import { FlashCountKeys, useFlashCount } from '$store';
import { StakingWidgetStatus } from './StakingWidgetStatus';
import { logEvent } from '@amplitude/analytics-browser';
import { t } from '@tonkeeper/shared/i18n';
import { Flash } from '@tonkeeper/uikit';
import { useStakingState } from '@tonkeeper/shared/hooks';

interface Props {
  isWatchOnly: boolean;
  showBuyButton: boolean;
}

const StakingWidgetComponent: FC<Props> = (props) => {
  const { isWatchOnly, showBuyButton } = props;

  const nav = useNavigation();

  const highestApyPool = useStakingState((s) => s.highestApyPool);
  const [flashShownCount] = useFlashCount(FlashCountKeys.StakingWidget);

  const stakingInfo = useStakingStatuses();

  const handleStakingPress = useCallback(() => {
    logEvent('staking_open');
    nav.push(MainStackRouteNames.Staking);
  }, [nav]);

  const handleBuyPress = useCallback(() => {
    nav.openModal('Exchange');
  }, [nav]);

  const staked = stakingInfo.length > 0;

  const apyDescription = highestApyPool
    ? t('staking.widget_desc', {
        apy: highestApyPool.apy.toFixed(2),
      })
    : '';

  const shouldShowBuyButton = showBuyButton && !isWatchOnly && !staked;

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
        {!isWatchOnly && (
          <Flash disabled={flashShownCount >= 2}>
            <StakingListCell
              isWidget={!staked}
              isWidgetAccent={shouldShowBuyButton}
              id="staking"
              name={t('staking.widget_title')}
              description={staked ? t('staking.widget_staking_options') : apyDescription}
              onPress={handleStakingPress}
              separator={shouldShowBuyButton}
            />
          </Flash>
        )}
        {shouldShowBuyButton ? (
          <StakingListCell
            isWidget
            isBuyTon
            id="buy_ton"
            name={t('buy_ton.title')}
            description={t('buy_ton.subtitle')}
            onPress={handleBuyPress}
          />
        ) : null}
      </List>
    </View>
  );
};

export const StakingWidget = memo(StakingWidgetComponent);

const styles = Steezy.create({
  container: {
    paddingHorizontal: 16,
    // paddingTop: 32,
  },
});
