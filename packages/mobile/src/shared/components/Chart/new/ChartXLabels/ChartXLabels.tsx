import { Text } from '$uikit/Text/Text';
import React, { useState } from 'react';
import { Platform } from 'react-native';
import Animated, { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { useChartData } from '@rainbow-me/animated-charts';
import { getLocale, ns } from '$utils';
import { format } from 'date-fns';
import { ChartPeriod } from '$store/zustand/chart';

export interface ChartXLabelsProps {
  currentPeriod: ChartPeriod;
}

const fontFamily = Platform.select({
  ios: 'SFMono-Medium',
  android: 'RobotoMono-Medium',
});

const formatDate = (text: string | undefined, currentPeriod: ChartPeriod) => {
  if (!text) return;

  let mode = 'HH:mm';

  switch (currentPeriod) {
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

  const date = new Date(parseInt(text) * 1000);
  return format(date, mode, { locale: getLocale() });
};

export const ChartXLabelsComponent: React.FC<ChartXLabelsProps> = (props) => {
  const { currentPeriod } = props;
  const chartData = useChartData();
  const [X1Value, setX1Value] = useState();
  const [X3Value, setX3Value] = useState();

  const { rect1XLabel } = chartData;

  useAnimatedReaction(
    () => rect1XLabel?.value,
    (result, previous) => {
      if (result !== previous) {
        runOnJS(setX1Value)(result);
      }
    },
    [rect1XLabel],
  );

  const { rect3XLabel } = chartData;

  useAnimatedReaction(
    () => rect3XLabel?.value,
    (result, previous) => {
      if (result !== previous) {
        runOnJS(setX3Value)(result);
      }
    },
    [rect3XLabel],
  );

  return (
    <>
      <Animated.View style={[{ position: 'absolute', left: ns(44.5), bottom: ns(2.5) }]}>
        <Text style={{ fontFamily }} variant="label3" color="backgroundTertiary">
          {formatDate(X1Value, currentPeriod)}
        </Text>
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', left: ns(203.5), bottom: ns(2.5) }]}>
        <Text style={{ fontFamily }} variant="label3" color="backgroundTertiary">
          {formatDate(X3Value, currentPeriod)}
        </Text>
      </Animated.View>
    </>
  );
};

export const ChartXLabels = React.memo(ChartXLabelsComponent);
