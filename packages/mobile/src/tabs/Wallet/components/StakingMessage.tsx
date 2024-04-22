import { usePoolInfo } from '$hooks/usePoolInfo';
import { useStakingCycle } from '$hooks/useStakingCycle';
import React, { FC, memo, useContext, useMemo } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { Text, View } from '$uikit';
import { stakingFormatter } from '@tonkeeper/shared/formatter';
import {
  AccountStakingInfo,
  PoolImplementationType,
  PoolInfo,
} from '@tonkeeper/core/src/TonAPI';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { TouchableHighlight } from 'react-native';
import { Steezy } from '$styles';
import { useTheme } from '@tonkeeper/uikit';
import { ListItemPressedContext } from '@tonkeeper/uikit/src/components/List/ListItemPressedContext';

interface Props {
  pool: PoolInfo;
  poolStakingInfo: AccountStakingInfo;
}

const StakingMessageComponent: FC<Props> = (props) => {
  const { pool, poolStakingInfo } = props;
  const theme = useTheme();
  const isPressed = useContext(ListItemPressedContext);

  const {
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

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      isPressed?.value || 0,
      [0, 1],
      [theme.backgroundContentTint, theme.backgroundHighlighted],
    ),
  }));

  const onMessagePress = hasReadyWithdraw ? handleConfirmWithdrawalPress : undefined;

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
    pendingDeposit.amount,
    pendingDeposit.totalTon,
    pendingWithdraw.amount,
    pendingWithdraw.totalTon,
    pool.implementation,
    readyWithdraw.amount,
    readyWithdraw.totalTon,
  ]);

  if (!message) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.messageContainer}>
        <Animated.View style={[styles.message.static, backgroundStyle]}>
          <TouchableHighlight
            underlayColor={theme.backgroundHighlighted}
            onPress={onMessagePress}
            disabled={!onMessagePress}
          >
            <View style={styles.messageInner}>
              <Text variant="body2">{message}</Text>
            </View>
          </TouchableHighlight>
        </Animated.View>
      </View>
    </View>
  );
};

export const StakingMessage = memo(StakingMessageComponent);

const styles = Steezy.create(({ colors }) => ({
  messageContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  message: {
    borderRadius: 12,
    backgroundColor: colors.backgroundContentTint,
    marginLeft: 60,
    marginTop: -8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  messageInner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
}));
