import { useStakingStatuses } from '$hooks/useStakingStatuses';
import { StakingListCell } from '$shared/components';
import { View } from '$uikit';
import { List } from '$uikit/List/old/List';
import React, { FC, memo, useCallback } from 'react';
import { useNavigation } from '@tonkeeper/router';
import { Steezy } from '$styles';
import { StakingWidgetStatus } from './StakingWidgetStatus';
import { t } from '@tonkeeper/shared/i18n';
interface Props {
  isWatchOnly: boolean;
  showBuyButton: boolean;
}

const StakingWidgetComponent: FC<Props> = (props) => {
  const { isWatchOnly, showBuyButton } = props;

  const nav = useNavigation();

  const stakingInfo = useStakingStatuses();

  const handleBuyPress = useCallback(() => {
    nav.openModal('Exchange');
  }, [nav]);

  const staked = stakingInfo.length > 0;

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
