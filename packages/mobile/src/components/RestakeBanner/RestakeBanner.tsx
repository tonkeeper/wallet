import React, { memo, useCallback, useEffect, useMemo } from 'react';
import {
  Button,
  Icon,
  Spacer,
  Steezy,
  Text,
  TouchableOpacity,
  View,
} from '@tonkeeper/uikit';
import { t } from '@tonkeeper/shared/i18n';
import { replaceString } from '@tonkeeper/shared/utils/replaceString';
import { PoolImplementationType, PoolInfo } from '@tonkeeper/core/src/TonAPI';
import { RestakeStep } from './RestakeStep';
import { usePoolInfo } from '$hooks/usePoolInfo';
import { AppStackRouteNames } from '$navigation';
import { StakingTransactionType } from '$core/StakingSend/types';
import { useNavigation } from '@tonkeeper/router';
import { formatter } from '@tonkeeper/shared/formatter';
import { useStakingState } from '@tonkeeper/shared/hooks';
import { useStakingCycle } from '$hooks/useStakingCycle';
import { LayoutAnimation } from 'react-native';
import { tk } from '$wallet';
import { Address } from '@tonkeeper/core';
import { IconsComposition } from './IconsComposition';

export interface ExtendedPoolInfo extends PoolInfo {
  isWithdrawal: boolean;
  balance: string | undefined;
}

export interface RestakeBannerProps {
  poolsList: ExtendedPoolInfo[];
  migrateFrom: string;
}

export enum RestakeSteps {
  UNSTAKE = 1,
  WAIT_FOR_WITHDRAWAL = 2,
  STAKE_INTO_TONSTAKERS = 3,
  DONE = 4,
}

export const RestakeBanner = memo<RestakeBannerProps>((props) => {
  const nav = useNavigation();
  const tonstakersPool = useMemo(() => {
    return props.poolsList.find(
      (pool) => pool.implementation === PoolImplementationType.LiquidTF,
    ) as ExtendedPoolInfo;
  }, [props.poolsList]);
  const { handleTopUpPress } = usePoolInfo(tonstakersPool);

  const handleCloseRestakeBanner = useCallback(() => {
    LayoutAnimation.easeInEaseOut();
    tk.wallet.staking.toggleRestakeBanner(false);
  }, []);

  const poolToWithdrawal = useMemo(
    () =>
      props.poolsList.find((pool) => Address.compare(pool.address, props.migrateFrom)),
    [props.migrateFrom, props.poolsList],
  );
  const toWithdrawalStakingInfo = useStakingState(
    (s) => poolToWithdrawal && s.stakingInfo[poolToWithdrawal.address],
    [poolToWithdrawal],
  );

  const handleWithdrawal = useCallback(
    (pool: ExtendedPoolInfo, withdrawAll?: boolean) => () => {
      nav.push(AppStackRouteNames.StakingSend, {
        amount: withdrawAll && pool.balance,
        poolAddress: pool.address,
        transactionType:
          pool.implementation === PoolImplementationType.Tf
            ? StakingTransactionType.WITHDRAWAL_CONFIRM
            : StakingTransactionType.WITHDRAWAL,
      });
    },
    [nav],
  );

  const isWaitingForWithdrawal = toWithdrawalStakingInfo?.pending_withdraw;
  const currentStepId = useMemo(() => {
    if (tonstakersPool?.balance) {
      return RestakeSteps.DONE;
    }
    // Go to last step if pool to withdrawal is empty now
    if (!poolToWithdrawal?.balance) {
      return RestakeSteps.STAKE_INTO_TONSTAKERS;
    }
    // If user has pending withdrawal, render step with waiting
    if (isWaitingForWithdrawal) {
      return RestakeSteps.WAIT_FOR_WITHDRAWAL;
    }
    return RestakeSteps.UNSTAKE;
  }, [isWaitingForWithdrawal, poolToWithdrawal, tonstakersPool?.balance]);

  useEffect(() => {
    if (currentStepId === RestakeSteps.DONE) {
      handleCloseRestakeBanner();
    }
  }, [currentStepId, handleCloseRestakeBanner]);

  const { formattedDuration } = useStakingCycle(
    poolToWithdrawal?.cycle_start,
    poolToWithdrawal?.cycle_end,
    isWaitingForWithdrawal,
  );

  return (
    <View style={styles.container}>
      <IconsComposition />
      <TouchableOpacity
        onPress={handleCloseRestakeBanner}
        activeOpacity={0.95}
        style={styles.absoluteCloseButton}
      >
        <Icon name={'ic-xmark-outline-28'} color="iconTertiary" />
      </TouchableOpacity>
      <Spacer y={20} />
      <Text type="h3">
        {replaceString(t('restake_banner.title'), '%apy', () => (
          <Text type="h3" color="accentBlue">
            APY {tonstakersPool.apy.toFixed(2)}%
          </Text>
        ))}
      </Text>
      <Spacer y={12} />
      <View>
        <RestakeStep
          completed={currentStepId > RestakeSteps.UNSTAKE}
          actions={
            poolToWithdrawal &&
            currentStepId > RestakeSteps.UNSTAKE && [
              <Button
                color="primary"
                size="small"
                onPress={handleWithdrawal(poolToWithdrawal, true)}
                title={t('restake_banner.unstake_action_all', {
                  amount: formatter.format(poolToWithdrawal.balance, {
                    currency: 'TON',
                  }),
                })}
              />,
              <Button
                color="tertiary"
                size="small"
                onPress={handleWithdrawal(poolToWithdrawal)}
                title={t('restake_banner.unstake_action_manual')}
              />,
            ]
          }
          stepId={RestakeSteps.UNSTAKE}
          text={t('restake_banner.unstake_step')}
        />
        <RestakeStep
          completed={currentStepId > RestakeSteps.WAIT_FOR_WITHDRAWAL}
          stepId={RestakeSteps.WAIT_FOR_WITHDRAWAL}
          text={
            currentStepId !== RestakeSteps.WAIT_FOR_WITHDRAWAL
              ? t('restake_banner.wait_step')
              : t('restake_banner.wait_step_pending', { duration: formattedDuration })
          }
        />
        <RestakeStep
          completed={currentStepId > RestakeSteps.STAKE_INTO_TONSTAKERS}
          actionsContainerStyle={styles.lastActionsContainer}
          stepId={RestakeSteps.STAKE_INTO_TONSTAKERS}
          actions={[
            <Button
              size="small"
              color={
                currentStepId === RestakeSteps.STAKE_INTO_TONSTAKERS
                  ? 'primary'
                  : 'tertiary'
              }
              onPress={handleTopUpPress}
              title={t('restake_banner.stake_into_tonstakers_action')}
            />,
          ]}
          text={t('restake_banner.stake_into_step')}
        />
      </View>
    </View>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    backgroundColor: colors.backgroundContent,
    borderRadius: 16,
    padding: 24,
  },
  lastActionsContainer: {
    paddingBottom: 0,
  },
  absoluteCloseButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
