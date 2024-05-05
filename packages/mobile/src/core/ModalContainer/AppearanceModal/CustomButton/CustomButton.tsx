import { useTheme } from '$hooks/useTheme';
import { AccentModel } from '$styled';
import { ButtonProps } from '$uikit/Button/Button.interface';
import React, { FC, memo, ReactNode, useCallback, useMemo, useState } from 'react';
import {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import * as S from './CustomButton.style';

const ANIMATION_DURATION = 150;

interface Props extends ButtonProps {
  accents: AccentModel[];
  selectedAccentIndex: number;
  children: ReactNode;
}

const Background: FC<{
  color: string;
  animation: SharedValue<boolean[]>;
  index: number;
}> = ({ color, index, animation }) => {
  const style = useAnimatedStyle(() => {
    const value = animation.value[index];

    return {
      opacity: withDelay(
        value ? 0 : ANIMATION_DURATION,
        withTiming(value ? 1 : 0, {
          duration: value ? ANIMATION_DURATION : 0,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      zIndex: value ? 1 : 0,
    };
  });

  return <S.ButtonBackground style={style} color={color} />;
};

const CustomButtonComponent: FC<Props> = (props) => {
  const { accents, selectedAccentIndex, ...buttonProps } = props;

  const colors = useMemo(
    () => [
      ...accents.map((accent) => ({
        default: accent.colors.accentPrimary,
        pressed: accent.colors.accentPrimaryLight,
      })),
    ],
    [accents],
  );

  const animation = useDerivedValue(
    () => [...accents.map((_, i) => i === selectedAccentIndex)],
    [selectedAccentIndex],
  );
  const [isPressed, setPressed] = useState(false);

  const handlePressIn = useCallback(() => {
    setPressed(true);
  }, [setPressed]);

  const handlePressOut = useCallback(() => {
    setPressed(false);
  }, [setPressed]);

  return (
    <S.Container>
      {colors.map((item, i) => (
        <Background
          key={`${item.default}_${i}`}
          color={isPressed ? item.pressed : item.default}
          index={i}
          animation={animation}
        />
      ))}
      <S.Button onPressIn={handlePressIn} onPressOut={handlePressOut} {...buttonProps} />
    </S.Container>
  );
};

export const CustomButton = memo(CustomButtonComponent);
