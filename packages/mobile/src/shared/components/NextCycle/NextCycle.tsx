import { useTranslator } from '$hooks';
import { Text } from '$uikit';
import React, { FC, memo, useCallback, useEffect, useState } from 'react';
import * as S from './NextCycle.style';
import { intervalToDuration } from 'date-fns';
import { LayoutChangeEvent } from 'react-native';
import { interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

interface Props {
  timestamp: number;
  frequency: number;
}

const NextCycleComponent: FC<Props> = (props) => {
  const { timestamp, frequency } = props;

  const t = useTranslator();

  const [now, setNow] = useState(Date.now());

  const endTimestamp = timestamp * 1000;

  const startTimestamp = endTimestamp - frequency * 3600 * 1000;

  const duration = intervalToDuration({ start: now, end: endTimestamp });

  const containerWidth = useSharedValue(0);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      containerWidth.value = event.nativeEvent.layout.width;
    },
    [containerWidth],
  );

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: interpolate(now, [startTimestamp, endTimestamp], [containerWidth.value, 0]),
  }));

  useEffect(() => {
    const timerId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  return (
    <S.Container onLayout={handleLayout}>
      <S.ProgressView style={progressAnimatedStyle} />
      <S.Row>
        <Text variant="label1">{t('staking.details.next_cycle.title')}</Text>
        <Text color="foregroundSecondary">
          {t('staking.details.next_cycle.time', {
            time: `${duration.hours! + duration.days! * 24}:${
              duration.minutes! < 10 ? `0${duration.minutes}` : duration.minutes
            }:${duration.seconds! < 10 ? `0${duration.seconds}` : duration.seconds}`,
          })}
        </Text>
      </S.Row>
      <Text variant="body2" color="foregroundSecondary">
        {t('staking.details.next_cycle.desc')}
      </Text>
    </S.Container>
  );
};

export const NextCycle = memo(NextCycleComponent);
