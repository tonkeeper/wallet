import { Text } from '$uikit/Text/Text';
import React, { useState } from 'react';
import { Platform } from 'react-native';
import Animated, { runOnJS, useAnimatedReaction, useDerivedValue } from 'react-native-reanimated';
import { useChartData } from '@rainbow-me/animated-charts';
import { ns } from '$utils';

export interface ChartXLabelsProps {
  minPrice: string;
  maxPrice: string;
}

const fontFamily = Platform.select({
  ios: 'SFMono-Medium',
  android: 'RobotoMono-Medium',
});

export const ChartXLabelsComponent: React.FC = () => {
  const chartData = useChartData();
  const [points, setPoints] = useState([]);

  useAnimatedReaction(
    () => {
      return chartData.data?.points;
    },
    (result, previous) => {
      if (result !== previous) {
        runOnJS(setPoints)(result);
      }
    },
    [chartData],
  );

  console.log(points);

  return (
    <>
      <Animated.View style={[{ position: 'absolute', left: ns(44.5), bottom: ns(2.5) }]}>
        <Text style={{ fontFamily }} variant="label3" color="backgroundTertiary">
          12:00
        </Text>
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', left: ns(203.5), bottom: ns(2.5) }]}>
        <Text style={{ fontFamily }} variant="label3" color="backgroundTertiary">
          00:00
        </Text>
      </Animated.View>
    </>
  );
};

export const ChartXLabels = React.memo(ChartXLabelsComponent);
