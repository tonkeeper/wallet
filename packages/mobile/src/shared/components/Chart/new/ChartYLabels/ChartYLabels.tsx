import { Text } from '$uikit/Text/Text';
import React from 'react';
import { Platform } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useChartData } from '@rainbow-me/animated-charts';

export interface ChartYLabelsProps {
  minPrice: string;
  maxPrice: string;
}

const fontFamily = Platform.select({
  ios: 'SFMono-Medium',
  android: 'RobotoMono-Medium',
});

export const ChartYLabelsComponent: React.FC<ChartYLabelsProps> = (props) => {
  const chartData = useChartData();

  const labelStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming([0, 5, 1].includes(chartData?.state.value) ? 1 : 0, {
        duration: 200,
      }),
    };
  }, [chartData?.state.value]);

  // don't show labels if minPrice and maxPrice are 0
  if (props.minPrice === '0' && props.maxPrice === '0') {
    return null;
  }

  return (
    <>
      <Animated.View
        style={[labelStyle, { position: 'absolute', right: 15.5, bottom: 23 }]}
      >
        <Text style={{ fontFamily }} variant="label3" color="foregroundSecondary">
          {props.minPrice}
        </Text>
      </Animated.View>
      <Animated.View
        style={[labelStyle, { position: 'absolute', right: 15.5, top: 68.5 }]}
      >
        <Text style={{ fontFamily }} variant="label3" color="foregroundSecondary">
          {props.maxPrice}
        </Text>
      </Animated.View>
    </>
  );
};

export const ChartYLabels = React.memo(ChartYLabelsComponent);
