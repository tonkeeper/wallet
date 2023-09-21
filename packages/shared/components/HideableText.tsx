import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { Text, TextProps } from '@tonkeeper/uikit';
import { memo } from 'react';

// TODO: move
import { useHideableAmount } from '@tonkeeper/mobile/src/core/HideableAmount/HideableAmountProvider';

export enum AnimationDirection {
  Left = -1,
  Right = 1,
  None = 0,
}

interface HideableTextProps extends TextProps {
  animationDirection?: AnimationDirection;
  numStars?: number;
}

const HideableTextComponent = (props: HideableTextProps) => {
  const {
    animationDirection = AnimationDirection.Right,
    numStars = 3,
    children,
    style,
    ...rest
  } = props;
  const animationProgress = useHideableAmount();

  const translateXTo = 10 * animationDirection;

  const amountStyle = useAnimatedStyle(() => ({
    display: animationProgress.value < 0.5 ? 'flex' : 'none',
    opacity: interpolate(animationProgress.value, [0, 0.5], [1, 0]),
    transform: [
      {
        translateX: interpolate(animationProgress.value, [0, 0.5], [0, translateXTo]),
      },
      {
        scale: interpolate(animationProgress.value, [0, 0.5], [1, 0.85]),
      },
    ],
  }));

  const starsStyle = useAnimatedStyle(() => ({
    display: animationProgress.value > 0.5 ? 'flex' : 'none',
    opacity: interpolate(animationProgress.value, [1, 0.5], [1, 0]),
    transform: [
      {
        translateX: interpolate(animationProgress.value, [1, 0.5], [0, translateXTo]),
      },
      {
        scale: interpolate(animationProgress.value, [1, 0.5], [1, 0.85]),
      },
    ],
  }));

  return (
    <Animated.View>
      <Text style={[amountStyle, style]} {...rest} reanimated>
        {children}
      </Text>
      <Text style={[starsStyle, style]} {...rest} reanimated>
        {'* '.repeat(numStars)}
      </Text>
    </Animated.View>
  );
};

export const HideableText = memo(HideableTextComponent);
