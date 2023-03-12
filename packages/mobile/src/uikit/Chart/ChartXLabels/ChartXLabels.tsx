import { Text } from '$uikit/Text/Text';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Animated, { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { useChartData } from '@rainbow-me/animated-charts';
import { getLocale, ns } from '$utils';
import { ChartPeriod } from '../Chart.types';
import { format, subMonths } from 'date-fns';

export interface ChartXLabelsProps {
  currentPeriod: ChartPeriod;
}

const fontFamily = Platform.select({
  ios: 'SFMono-Medium',
  android: 'RobotoMono-Medium',
});

export const ChartXLabelsComponent: React.FC<ChartXLabelsProps> = (props) => {
  const chartData = useChartData();
  const [X1Value, setX1Value] = useState();
  const [X3Value, setX3Value] = useState();

  const updateLabel = useCallback(
    (text, onUpdate) => {
      let mode = 'HH:mm';

      switch (props.currentPeriod) {
        case ChartPeriod.ONE_HOUR:
          mode = 'HH:mm';
          break;
        case ChartPeriod.ONE_DAY:
          mode = 'HH:mm';
          break;
        case ChartPeriod.SEVEN_DAYS:
          mode = 'dd MMM';
          break;
        case ChartPeriod.ONE_MONTH:
          mode = 'dd MMM';
          break;
        case ChartPeriod.SIX_MONTHS:
          mode = 'dd MMM';
          break;
        case ChartPeriod.ONE_YEAR:
          mode = 'dd MMM';
          break;
        default:
          mode = 'HH:mm';
          break;
      }
      if (!text) return;
      const date = new Date(parseInt(text) * 1000);
      onUpdate(format(date, mode, { locale: getLocale() }));
    },
    [props.currentPeriod],
  );

  useAnimatedReaction(
    () => {
      return chartData.rect1XLabel?.value;
    },
    (result, previous) => {
      if (result !== previous) {
        runOnJS(updateLabel)(result, setX1Value);
      }
    },
    [chartData, updateLabel],
  );

  useAnimatedReaction(
    () => {
      return chartData.rect3XLabel?.value;
    },
    (result, previous) => {
      if (result !== previous) {
        runOnJS(updateLabel)(result, setX3Value);
      }
    },
    [chartData, updateLabel],
  );

  return (
    <>
      <Animated.View style={[{ position: 'absolute', left: ns(44.5), bottom: ns(2.5) }]}>
        <Text style={{ fontFamily }} variant="label3" color="backgroundTertiary">
          {X1Value}
        </Text>
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', left: ns(203.5), bottom: ns(2.5) }]}>
        <Text style={{ fontFamily }} variant="label3" color="backgroundTertiary">
          {X3Value}
        </Text>
      </Animated.View>
    </>
  );
};

export const ChartXLabels = React.memo(ChartXLabelsComponent);
