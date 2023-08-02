import { StyleSheet, View } from 'react-native';
import { useTheme } from '../styles';
import { memo } from 'react';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated';

interface StepIndicatorProps {
  pageOffset: Animated.SharedValue<number>;
  offsetInterval: number;
  steps: number;
}

const INDICATOR_WIDTH = 16;
const INDICATOR_HEIGHT = 4;
const INDICATOR_EXPANDED_SIZE = 24;

export const StepIndicator = memo((props: StepIndicatorProps) => {
  const { pageOffset, offsetInterval, steps } = props;

  return (
    <View style={styles.container}>
      {Array(steps)
        .fill(0)
        .map((_, index) => (
          <Indicator
            key={`step-indicator-${index}`}
            pageOffset={pageOffset}
            offsetInterval={offsetInterval}
            index={index}
          />
        ))}
    </View>
  );
});

interface IndicatorProps {
  pageOffset: Animated.SharedValue<number>;
  offsetInterval: number;
  index: number;
}

const Indicator = memo((props: IndicatorProps) => {
  const { pageOffset, offsetInterval, index } = props;
  const theme = useTheme();

  const inputRange = [
    (index - 1) * offsetInterval,
    index * offsetInterval,
    (index + 1) * offsetInterval,
  ];

  const dotAnimationStyle = useAnimatedStyle(() => ({
    width: interpolate(
      pageOffset.value,
      inputRange,
      [INDICATOR_WIDTH, INDICATOR_EXPANDED_SIZE, INDICATOR_WIDTH],
      Extrapolate.CLAMP,
    ),
    backgroundColor: interpolateColor(pageOffset.value, inputRange, [
      theme.backgroundContent,
      theme.accentBlue,
      theme.backgroundContent,
    ]),
  }));

  return <Animated.View style={[styles.dotStyle, dotAnimationStyle]} />;
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dotStyle: {
    width: INDICATOR_WIDTH,
    height: INDICATOR_HEIGHT,
    borderRadius: INDICATOR_WIDTH,
    marginHorizontal: 2,
    backgroundColor: '#FFF',
  },
});
