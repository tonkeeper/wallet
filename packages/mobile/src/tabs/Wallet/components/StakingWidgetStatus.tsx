import { usePoolInfo, useStakingCycle, useTranslator } from '$hooks';
import { StakingListCell } from '$shared/components';
import { getPoolIcon } from '$utils';
import { AccountStakingInfo, PoolInfo } from '@tonkeeper/core/src/legacy';
import React, { FC, Fragment, memo, useCallback } from 'react';
import { useNavigation } from '@tonkeeper/router';
import { MainStackRouteNames } from '$navigation';

interface Props {
  pool: PoolInfo;
  poolStakingInfo: AccountStakingInfo;
}

const StakingWidgetStatusComponent: FC<Props> = (props) => {
  const { pool, poolStakingInfo } = props;

  const {
    stakingJetton,
    balance,
    pendingDeposit,
    pendingWithdraw,
    readyWithdraw,
    hasDeposit,
    hasPendingDeposit,
    hasPendingWithdraw,
    hasReadyWithdraw,
    handleConfirmWithdrawalPress,
  } = usePoolInfo(pool, poolStakingInfo);

  const { formattedDuration, isCooldown } = useStakingCycle(
    pool.cycleStart,
    pool.cycleEnd,
    hasPendingWithdraw,
  );

  const t = useTranslator();
  const nav = useNavigation();

  const iconSource = getPoolIcon(pool);

  const handlePoolPress = useCallback(() => {
    nav.push(MainStackRouteNames.StakingPoolDetails, { poolAddress: pool.address });
  }, [nav, pool.address]);

  return (
    <>
      {hasReadyWithdraw ? (
        <StakingListCell
          id={`readyWithdraw_${pool.address}`}
          name={t('staking.details.readyWithdraw')}
          description={t('staking.details.tap_to_collect')}
          balance={readyWithdraw.amount}
          iconSource={iconSource}
          numberOfLines={1}
          separator={true}
          onPress={handleConfirmWithdrawalPress}
        />
      ) : null}
      {!hasReadyWithdraw && hasPendingWithdraw ? (
        <StakingListCell
          id={`pendingWithdraw_${pool.address}`}
          name={t('staking.details.pendingWithdraw')}
          description={isCooldown ? pool.name : formattedDuration}
          balance={pendingWithdraw.amount}
          iconSource={iconSource}
          numberOfLines={1}
          separator={true}
          onPress={handlePoolPress}
        />
      ) : null}
      {hasPendingDeposit ? (
        <StakingListCell
          id={`pendingDeposit_${pool.address}`}
          name={t('staking.details.pendingDeposit')}
          description={pool.name}
          balance={pendingDeposit.amount}
          iconSource={iconSource}
          numberOfLines={1}
          separator={true}
          onPress={handlePoolPress}
        />
      ) : null}
      {hasDeposit ? (
        <StakingListCell
          id={`amount_${pool.address}`}
          name={t('staking.details.balance')}
          description={pool.name}
          balance={balance.amount}
          stakingJetton={stakingJetton}
          iconSource={iconSource}
          numberOfLines={1}
          separator={true}
          onPress={handlePoolPress}
        />
      ) : null}
    </>
  );
};

export const StakingWidgetStatus = memo(StakingWidgetStatusComponent);
