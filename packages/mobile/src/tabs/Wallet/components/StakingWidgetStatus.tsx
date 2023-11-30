import { usePoolInfo } from '$hooks/usePoolInfo';
import { useStakingCycle } from '$hooks/useStakingCycle';
import { StakingListCell } from '$shared/components';
import React, { FC, memo, useCallback, useMemo } from 'react';
import { useNavigation } from '@tonkeeper/router';
import { MainStackRouteNames } from '$navigation';
import { t } from '@tonkeeper/shared/i18n';
import { StakedTonIcon, Text } from '$uikit';
import { stakingFormatter } from '@tonkeeper/shared/formatter';
import {
  AccountStakingInfo,
  PoolImplementationType,
  PoolInfo,
} from '@tonkeeper/core/src/TonAPI';

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
    hasPendingDeposit,
    hasPendingWithdraw,
    hasReadyWithdraw,
    handleConfirmWithdrawalPress,
  } = usePoolInfo(pool, poolStakingInfo);

  const { formattedDuration, isCooldown } = useStakingCycle(
    pool.cycle_start,
    pool.cycle_end,
    hasPendingWithdraw || hasPendingDeposit,
  );

  const nav = useNavigation();

  const handlePoolPress = useCallback(() => {
    nav.push(MainStackRouteNames.StakingPoolDetails, { poolAddress: pool.address });
  }, [nav, pool.address]);

  const message = useMemo(() => {
    if (hasReadyWithdraw) {
      return t('staking.message.readyWithdraw', {
        amount: stakingFormatter.format(readyWithdraw.amount),
        count: Math.floor(readyWithdraw.totalTon),
      });
    }

    if (hasPendingWithdraw) {
      if (pool.implementation === PoolImplementationType.LiquidTF) {
        return t('staking.message.pendingWithdrawLiquid', {
          amount: stakingFormatter.format(pendingWithdraw.amount),
          count: pendingWithdraw.totalTon,
        });
      }

      return (
        <>
          {t('staking.message.pendingWithdraw', {
            amount: stakingFormatter.format(pendingWithdraw.amount),
            count: pendingWithdraw.totalTon,
          })}
          {!isCooldown ? (
            <Text variant="body2">
              {t('staking.details.next_cycle.in')}{' '}
              <Text variant="body2" style={{ fontVariant: ['tabular-nums'] }}>
                {formattedDuration}
              </Text>
            </Text>
          ) : null}
        </>
      );
    }

    if (hasPendingDeposit) {
      return (
        <>
          {t('staking.message.pendingDeposit', {
            amount: stakingFormatter.format(pendingDeposit.amount),
            count: Math.floor(pendingDeposit.totalTon),
          })}
          {!isCooldown ? (
            <Text variant="body2">
              {t('staking.details.next_cycle.in')}{' '}
              <Text variant="body2" style={{ fontVariant: ['tabular-nums'] }}>
                {formattedDuration}
              </Text>
            </Text>
          ) : null}
        </>
      );
    }
  }, [
    formattedDuration,
    hasPendingDeposit,
    hasPendingWithdraw,
    hasReadyWithdraw,
    isCooldown,
    pendingDeposit,
    pendingWithdraw,
    readyWithdraw,
  ]);

  return (
    <StakingListCell
      id={`amount_${pool.address}`}
      name={t('staking.staked')}
      description={pool.name}
      balance={balance.amount}
      stakingJetton={stakingJetton}
      icon={<StakedTonIcon pool={pool} size="small" />}
      numberOfLines={1}
      separator={true}
      message={message}
      onMessagePress={hasReadyWithdraw ? handleConfirmWithdrawalPress : undefined}
      onPress={handlePoolPress}
    />
  );
};

export const StakingWidgetStatus = memo(StakingWidgetStatusComponent);
