import { useStakingCycle } from '$hooks/useStakingCycle';
import { Text } from '$uikit';
import React, { FC, memo, useCallback } from 'react';
import * as S from './NextCycle.style';
import { LayoutChangeEvent } from 'react-native';
import { interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { t } from '@tonkeeper/shared/i18n';
import { PoolInfo, PoolImplementationType } from '@tonkeeper/core/src/TonAPI';

interface Props {
  pool: PoolInfo;
  reward?: boolean;
}

const NextCycleComponent: FC<Props> = (props) => {
  const {
    pool: { cycle_start, cycle_end, implementation },
    reward = false,
  } = props;

  const { formattedDuration, progress, isCooldown } = useStakingCycle(
    cycle_start,
    cycle_end,
  );

  const containerWidth = useSharedValue(0);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      containerWidth.value = event.nativeEvent.layout.width;
    },
    [containerWidth],
  );

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [0, containerWidth.value]),
  }));

  if (isCooldown && implementation !== PoolImplementationType.LiquidTF) {
    return (
      <S.Container>
        <S.Row>
          <Text variant="label1">{t('staking.details.cooldown.title')}</Text>
          <Text variant="label1">{t('staking.details.cooldown.active')}</Text>
        </S.Row>
        <Text variant="body2" color="foregroundSecondary">
          {t('staking.details.cooldown.desc')}
        </Text>
      </S.Container>
    );
  }

  return (
    <S.Container onLayout={handleLayout}>
      <S.ProgressView style={progressAnimatedStyle} />
      <S.Row>
        <Text variant="label1">
          {reward
            ? t('staking.details.next_cycle.reward_title')
            : t('staking.details.next_cycle.title')}
        </Text>
        <Text
          color={reward ? 'foregroundPrimary' : 'foregroundSecondary'}
          variant={reward ? 'label1' : 'body1'}
        >
          {t('staking.details.next_cycle.in')}{' '}
          <Text
            color={reward ? 'foregroundPrimary' : 'foregroundSecondary'}
            variant={reward ? 'label1' : 'body1'}
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {formattedDuration}
          </Text>
        </Text>
      </S.Row>
      {!reward ? (
        <Text variant="body2" color="foregroundSecondary">
          {implementation === PoolImplementationType.LiquidTF
            ? t('staking.details.next_cycle.desc_liquid')
            : t('staking.details.next_cycle.desc')}
        </Text>
      ) : null}
    </S.Container>
  );
};

export const NextCycle = memo(NextCycleComponent);
