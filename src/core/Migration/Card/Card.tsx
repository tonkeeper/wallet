import React, { FC, useEffect, useMemo } from 'react';
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import * as S from './Card.style';
import { CardProps } from '$core/Migration/Card/Card.interface';
import { useTheme, useTranslator } from '$hooks';
import { ns } from '$utils';
import { useCounter } from '$core/Migration/Card/useCounter';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { formatCryptoCurrency } from '$utils/currency';
import {Text} from "$uikit";

const PositionOffsetHorizontal = ns(57);
const PositionOffsetVertical = ns(28);

const positionDelay = 1000;
const positionDuration = 200;

const amountDelay = 100;
const amountDuration = 800;

export const Card: FC<CardProps> = (props) => {
  const { mode, address, amount, startValue } = props;
  const theme = useTheme();
  const t = useTranslator();

  const positionValue = useSharedValue(0);
  const amountValue = useCounter(
    positionDelay + positionDuration + amountDelay,
    amountDuration,
    amount,
    mode === 'old' ? 'decr' : 'incr',
    startValue,
  );

  useEffect(() => {
    positionValue.value = withDelay(
      positionDelay,
      withTiming(1, {
        duration: positionDuration,
        easing: Easing.inOut(Easing.ease),
      }),
    );
  }, []);

  const label = useMemo(() => {
    return t(mode === 'old' ? 'migration_old_wallet' : 'migration_new_wallet');
  }, [mode, t]);

  const backgroundColor = useMemo(() => {
    return theme.colors[mode === 'old' ? 'backgroundSecondary' : 'backgroundTertiary'];
  }, [mode, theme]);

  const positionStyle = useAnimatedStyle(() => {
    const y = mode === 'old' ? -PositionOffsetVertical : PositionOffsetVertical;
    const x = mode === 'old' ? -PositionOffsetHorizontal : PositionOffsetHorizontal;
    return {
      transform: [
        {
          translateY: interpolate(positionValue.value, [0, 1], [0, y]),
        },
        {
          translateX: interpolate(positionValue.value, [0, 1], [0, x]),
        },
      ],
    };
  });

  return (
    <S.Wrap style={[{ backgroundColor, zIndex: mode === 'old' ? 1 : 2 }, positionStyle]}>
      <Text color="accentPrimary" fontSize={14} lineHeight={20} fontWeight="700">
        {label}
      </Text>
      <S.AmountWrap>
        <Text numberOfLines={1} ellipsizeMode="middle" variant="label1" fontWeight="700">
          {address}
        </Text>
        <Text reanimated variant="label2" color="foregroundSecondary">
          {formatCryptoCurrency(
            amountValue,
            CryptoCurrencies.Ton,
            Decimals[CryptoCurrencies.Ton],
          )}
        </Text>
      </S.AmountWrap>
    </S.Wrap>
  );
};
