import { useTheme } from '$hooks/useTheme';
import { Icon } from '$uikit';
import React, { FC, memo, useCallback } from 'react';
import { Insets } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as S from './SwapButton.style';

interface Props {
  onPress: () => void;
}

const HIT_SLOP_INSETS: Insets = { top: 16, right: 16, bottom: 16, left: 16 };

const SwapButtonComponent: FC<Props> = (props) => {
  const { onPress } = props;

  const theme = useTheme();

  const pressed = useSharedValue(false);
  const iconAnimation = useSharedValue(0.5);

  const iconTranslateY = useDerivedValue(() =>
    interpolate(iconAnimation.value, [0, 0.5, 1], [-24, 0, 24]),
  );

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: pressed.value
      ? theme.colors.backgroundQuaternary
      : theme.colors.backgroundTertiary,
  }));

  const leftArrowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: iconTranslateY.value,
      },
    ],
  }));

  const rightArrowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: iconTranslateY.value * -1,
      },
      {
        rotate: '180deg',
      },
    ],
  }));

  const handlePressIn = useCallback(() => {
    pressed.value = true;
  }, [pressed]);

  const handlePressOut = useCallback(() => {
    pressed.value = false;
  }, [pressed]);

  const handlePress = useCallback(() => {
    onPress();

    iconAnimation.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0, { duration: 0 }),
      withSpring(0.5, {
        damping: 15,
        mass: 0.2,
      }),
    );
  }, [onPress, iconAnimation]);

  return (
    <S.Touchable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      hitSlop={HIT_SLOP_INSETS}
    >
      <S.Container style={containerStyle}>
        <S.LeftArrow style={leftArrowStyle} tintColor={theme.colors.iconPrimary} />
        <S.RightArrow style={rightArrowStyle} tintColor={theme.colors.iconPrimary} />
      </S.Container>
    </S.Touchable>
  );
};

export const SwapButton = memo(SwapButtonComponent);
