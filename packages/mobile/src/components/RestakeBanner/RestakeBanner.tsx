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
import { useFiatValue } from '$hooks/useFiatValue';
import { CryptoCurrencies } from '$shared/constants';
import { stakingFormatter } from '$utils/formatter';
import { useNotificationsStore } from '$store';

export interface ExtendedPoolInfo extends PoolInfo {
  isWithdrawal: boolean;
  balance: string | undefined;
}

export interface RestakeBannerProps {
  poolsList: ExtendedPoolInfo[];
  migrateFrom: string;
  bypassUnstakeStep?: boolean;
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
  const toggleRestakeBanner = useNotificationsStore(
    (state) => state.actions.toggleRestakeBanner,
  );

  const handleCloseRestakeBanner = useCallback(() => {
    LayoutAnimation.easeInEaseOut();
    toggleRestakeBanner(tk.wallet.address.ton.raw, false);
  }, [toggleRestakeBanner]);

  const poolToWithdrawal = useMemo(
    () =>
      props.poolsList.find((pool) => Address.compare(pool.address, props.migrateFrom)),
    [props.migrateFrom, props.poolsList],
  );
  const toWithdrawalStakingInfo = useStakingState(
    (s) => poolToWithdrawal && s.stakingInfo[poolToWithdrawal.address],
    [poolToWithdrawal],
  );

  const readyWithdraw = useFiatValue(
    CryptoCurrencies.Ton,
    stakingFormatter.fromNano(toWithdrawalStakingInfo?.ready_withdraw ?? '0'),
  );

  const isReadyWithdraw = readyWithdraw.amount !== '0';

  const handleWithdrawal = useCallback(
    (pool: ExtendedPoolInfo, withdrawAll?: boolean) => () => {
      if (pool.implementation === PoolImplementationType.Tf) {
        nav.push(AppStackRouteNames.StakingSend, {
          poolAddress: pool.address,
          transactionType: StakingTransactionType.WITHDRAWAL_CONFIRM,
        });
        return;
      }
      nav.push(AppStackRouteNames.StakingSend, {
        amount: withdrawAll && pool.balance,
        poolAddress: pool.address,
        transactionType: StakingTransactionType.WITHDRAWAL,
      });
    },
    [nav],
  );

  const handleCollectWithdrawal = useCallback(
    (pool: ExtendedPoolInfo) => () => {
      nav.push(AppStackRouteNames.StakingSend, {
        poolAddress: pool.address,
        transactionType: StakingTransactionType.WITHDRAWAL_CONFIRM,
      });
    },
    [nav],
  );

  const isWaitingForWithdrawal = toWithdrawalStakingInfo?.pending_withdraw;
  const currentStepId = useMemo(() => {
    if (tonstakersPool?.balance) {
      return RestakeSteps.DONE;
    }
    // Go to last step if pool to withdrawal is empty now (or if balance so small, or step is bypassed)
    if (
      props.bypassUnstakeStep ||
      !poolToWithdrawal?.balance ||
      Number(poolToWithdrawal?.balance) < 0.1
    ) {
      return RestakeSteps.STAKE_INTO_TONSTAKERS;
    }
    // If user has pending withdrawal, render step with waiting
    if (isWaitingForWithdrawal || readyWithdraw.amount !== '0') {
      return RestakeSteps.WAIT_FOR_WITHDRAWAL;
    }
    return RestakeSteps.UNSTAKE;
  }, [
    props.bypassUnstakeStep,
    isWaitingForWithdrawal,
    poolToWithdrawal?.balance,
    readyWithdraw.amount,
    tonstakersPool?.balance,
  ]);

  useEffect(() => {
    if (currentStepId === RestakeSteps.DONE) {
      handleCloseRestakeBanner();
    }
  }, [currentStepId, handleCloseRestakeBanner]);

  const { formattedDuration, isCooldown } = useStakingCycle(
    poolToWithdrawal?.cycle_start ?? Date.now(),
    poolToWithdrawal?.cycle_end ?? Date.now(),
    isWaitingForWithdrawal,
  );

  const renderFormattedDuration = useCallback(() => {
    return (
      <Text type="body1" color="textPrimary" style={{ fontVariant: ['tabular-nums'] }}>
        {formattedDuration}
      </Text>
    );
  }, [formattedDuration]);

  const waitForWithdrawalText = useMemo(() => {
    if (currentStepId !== RestakeSteps.WAIT_FOR_WITHDRAWAL) {
      return t('restake_banner.wait_step');
    }
    if (isReadyWithdraw) {
      return t('restake_banner.wait_step_withdraw');
    }
    if (isCooldown) {
      return t('restake_banner.wait_step_cooldown');
    }
    return replaceString(
      t('restake_banner.wait_step_pending'),
      '%duration',
      renderFormattedDuration,
    );
  }, [currentStepId, isCooldown, isReadyWithdraw, renderFormattedDuration]);

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
            currentStepId === RestakeSteps.UNSTAKE && [
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
              poolToWithdrawal.implementation !== PoolImplementationType.Tf && (
                <Button
                  color="tertiary"
                  size="small"
                  onPress={handleWithdrawal(poolToWithdrawal)}
                  title={t('restake_banner.unstake_action_manual')}
                />
              ),
            ]
          }
          stepId={RestakeSteps.UNSTAKE}
          text={t('restake_banner.unstake_step')}
        />
        <RestakeStep
          completed={currentStepId > RestakeSteps.WAIT_FOR_WITHDRAWAL}
          stepId={RestakeSteps.WAIT_FOR_WITHDRAWAL}
          text={waitForWithdrawalText}
          actions={
            currentStepId <= RestakeSteps.WAIT_FOR_WITHDRAWAL &&
            isReadyWithdraw && [
              <Button
                size="small"
                color={'primary'}
                onPress={handleCollectWithdrawal(poolToWithdrawal!)}
                title={t('restake_banner.wait_step_collect')}
              />,
            ]
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
