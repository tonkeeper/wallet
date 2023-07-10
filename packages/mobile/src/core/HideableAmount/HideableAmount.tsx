import React from 'react';
import { Text } from '$uikit';
import { TextProps } from '$uikit/Text/Text';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { Steezy } from '$styles';
import { useHideableAmount } from '$core/HideableAmount/HideableAmountProvider';

export enum AnimationDirection {
  Left = -1,
  Right = 1,
  None = 0,
}

const HideableAmountComponent: React.FC<
  TextProps & { stars?: string; animationDirection?: AnimationDirection }
> = ({
  children,
  style,
  animationDirection = AnimationDirection.Right,
  stars = '* * *',
  ...rest
}) => {
  const animationProgress = useHideableAmount();

  const translateXTo = 10 * animationDirection;

  const amountStyle = useAnimatedStyle(() => {
    return {
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
    };
  });

  const starsStyle = useAnimatedStyle(() => {
    return {
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
    };
  });

  return (
    <Animated.View>
      <Text style={[amountStyle, style]} {...rest} reanimated>
        {children}
      </Text>
      <Text style={[starsStyle, styles.stars.static, style]} {...rest} reanimated>
        {stars}
      </Text>
    </Animated.View>
  );
};

export const HideableAmount = React.memo(HideableAmountComponent);

const styles = Steezy.create({
  stars: {},
});
