import React, { FC, ReactNode, memo, useEffect } from 'react';
import { Steezy } from '../../styles';
import { StyleSheet, ViewProps, useWindowDimensions } from 'react-native';
import { View } from '../View';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { WithStyleProp } from '@bogoslavskiy/react-native-steezy';

const FlashSource = require('../../../assets/flash.png');

interface Props extends WithStyleProp<ViewProps> {
  children: ReactNode;
  disabled?: boolean;
}

const FlashComponent: FC<Props> = (props) => {
  const { children, disabled, style, ...viewProps } = props;

  const shouldAnimate = useSharedValue(false);

  const { width } = useWindowDimensions();

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateX: shouldAnimate.value
            ? withDelay(600, withTiming(width, { duration: 850 }))
            : -168,
        },
      ],
      height: '100%',
      opacity: 0.16,
    }),
    [width],
  );

  useEffect(() => {
    if (!disabled) {
      shouldAnimate.value = true;
    }
  }, [disabled]);

  return (
    <View style={[styles.container, style]} {...viewProps}>
      {children}
      <View style={styles.flash} pointerEvents="none">
        <Animated.Image style={animatedStyle} source={FlashSource} resizeMode="repeat" />
      </View>
    </View>
  );
};

const styles = Steezy.create({
  container: {
    position: 'relative',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'red',
    overflow: 'hidden',
  },
});

export const Flash = memo(FlashComponent);
