import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useHideableBalancesAnimation } from './HideableBalancesAnimation';
import { Text, TextProps } from '@tonkeeper/uikit';
import { memo } from 'react';

export enum AnimationDirection {
  Left = -1,
  Right = 1,
  None = 0,
}

interface HideableTextProps extends TextProps {
  animationDirection?: AnimationDirection;
  renderStart?: (stars: string) => string;
  numStars?: number;
}

const HideableTextComponent = (props: HideableTextProps) => {
  const animation = useHideableBalancesAnimation();
  const {
    animationDirection = AnimationDirection.Right,
    renderStart,
    numStars = 3,
    children,
    style,
    ...rest
  } = props;

  const translateXTo = 10 * animationDirection;

  const amountStyle = useAnimatedStyle(() => ({
    display: animation.value < 0.5 ? 'flex' : 'none',
    opacity: interpolate(animation.value, [0, 0.5], [1, 0]),
    transform: [
      {
        translateX: interpolate(animation.value, [0, 0.5], [0, translateXTo]),
      },
      {
        scale: interpolate(animation.value, [0, 0.5], [1, 0.85]),
      },
    ],
  }));

  const starsStyle = useAnimatedStyle(() => ({
    display: animation.value > 0.5 ? 'flex' : 'none',
    opacity: interpolate(animation.value, [1, 0.5], [1, 0]),
    transform: [
      {
        translateX: interpolate(animation.value, [1, 0.5], [0, translateXTo]),
      },
      {
        scale: interpolate(animation.value, [1, 0.5], [1, 0.85]),
      },
    ],
  }));

  const stars = '* '.repeat(numStars);

  return (
    <Animated.View>
      <Text style={[amountStyle, style]} {...rest} reanimated>
        {children}
      </Text>
      <Text style={[starsStyle, style]} {...rest} reanimated>
        {renderStart ? renderStart(stars) : stars}
      </Text>
    </Animated.View>
  );
};

export const HideableText = memo(HideableTextComponent);
