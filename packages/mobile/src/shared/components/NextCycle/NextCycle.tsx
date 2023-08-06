import { useStakingCycle } from '$hooks/useStakingCycle';
import { Text } from '$uikit';
import React, { FC, memo, useCallback } from 'react';
import * as S from './NextCycle.style';
import { LayoutChangeEvent } from 'react-native';
import { interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { PoolInfo } from '@tonkeeper/core/src/legacy';
import { t } from '@tonkeeper/shared/i18n';

interface Props {
  pool: PoolInfo;
}

const NextCycleComponent: FC<Props> = (props) => {
  const {
    pool: { cycleEnd, cycleStart, implementation },
  } = props;

  

  const { formattedDuration, progress, isCooldown } = useStakingCycle(
    cycleStart,
    cycleEnd,
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

  if (isCooldown && implementation !== 'liquidTF') {
    return (
      <S.Container>
        <S.Row>
          <Text variant="label1">{t('staking.details.cooldown.title')}</Text>
          <Text variant="label1" color="accentPositive">
            {t('staking.details.cooldown.active')}
          </Text>
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
        <Text variant="label1">{t('staking.details.next_cycle.title')}</Text>
        <Text color="foregroundSecondary">{formattedDuration}</Text>
      </S.Row>
      <Text variant="body2" color="foregroundSecondary">
        {implementation === 'liquidTF'
          ? t('staking.details.next_cycle.desc_liquid')
          : t('staking.details.next_cycle.desc')}
      </Text>
    </S.Container>
  );
};

export const NextCycle = memo(NextCycleComponent);
