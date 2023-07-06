import React, { useContext } from 'react';
import { Text } from '$uikit';
import { TextProps } from '$uikit/Text/Text';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { Steezy } from '$styles';
import { HideableAmountContext } from '$core/HideableAmount/HideableAmountProvider';

const HideableAmountComponent: React.FC<TextProps & { stars?: string }> = ({
  children,
  style,
  stars = '* * *',
  ...rest
}) => {
  const animationProgress = useContext(HideableAmountContext);

  const amountStyle = useAnimatedStyle(() => {
    return {
      display: animationProgress.value < 0.5 ? 'flex' : 'none',
      opacity: interpolate(animationProgress.value, [0, 0.5], [1, 0]),
      transform: [
        {
          translateX: interpolate(animationProgress.value, [0, 0.5], [0, 10]),
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
          translateX: interpolate(animationProgress.value, [1, 0.5], [0, 10]),
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
