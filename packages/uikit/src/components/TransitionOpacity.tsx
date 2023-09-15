import { StyleProp, ViewStyle } from 'react-native';
import { memo, useEffect, useState } from 'react';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

interface TransitionOpacity {
  isVisible: boolean;
  alwaysShown?: boolean;
  entranceAnimation?: boolean;
  style?: StyleProp<ViewStyle>;
  duration?: number;
  delay?: number;
  children: React.ReactNode;
}

export const TransitionOpacity = memo<TransitionOpacity>((props) => {
  const {
    children,
    isVisible,
    alwaysShown,
    style,
    entranceAnimation = true,
    duration = 150,
    delay = 250,
  } = props;

  const [shown, setIsShown] = useState(entranceAnimation ? false : true);
  const opacity = useSharedValue(entranceAnimation ? 0 : 1);

  useEffect(() => {
    if (isVisible) {
      if (!alwaysShown) {
        setIsShown(true);
      }

      opacity.value = withDelay(
        delay,
        withTiming(1, {
          duration,
        }),
      );
    } else {
      opacity.value = withTiming(
        0,
        {
          duration,
        },
        (isComplete) => {
          if (isComplete && !alwaysShown) {
            runOnJS(setIsShown)(false);
          }
        },
      );
    }
  }, [isVisible, alwaysShown]);

  const opacityStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!shown && !alwaysShown) {
    return null;
  }

  return <Animated.View style={[style, opacityStyle]}>{children}</Animated.View>;
});
