import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
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
  children: React.ReactNode;
}

export const TransitionOpacity: React.FC<TransitionOpacity> = (props) => {
  const {
    children,
    isVisible,
    alwaysShown,
    style,
    entranceAnimation = true,
    duration = 150,
  } = props;

  const [shown, setIsShown] = React.useState(false);
  const opacity = useSharedValue(entranceAnimation ? 0 : 1);

  React.useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(
        1,
        {
          duration,
        },
        (isComplete) => {
          if (isComplete) {
            runOnJS(setIsShown)(true);
          }
        },
      );
    } else {
      opacity.value = withTiming(
        0,
        {
          duration,
        },
        (isComplete) => {
          if (isComplete) {
            runOnJS(setIsShown)(false);
          }
        },
      );
    }
  }, [duration, isVisible, opacity]);

  const opacityStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!shown && !alwaysShown) {
    return null;
  }

  return <Animated.View style={[style, opacityStyle]}>{children}</Animated.View>;
};
