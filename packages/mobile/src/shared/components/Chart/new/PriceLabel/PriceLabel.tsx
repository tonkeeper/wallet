import React, { useCallback, useMemo, useState } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { Text } from '$uikit/Text/Text';
import { useChartData } from '@rainbow-me/animated-charts';
import { format } from 'date-fns';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { getLocale } from '$utils';
import { Platform } from 'react-native';
import { ChartPeriod } from '$store/zustand/chart';

const fontFamily = Platform.select({
  ios: 'SFMono-Medium',
  android: 'RobotoMono-Medium',
});

export const PriceLabel: React.FC<{ selectedPeriod: ChartPeriod }> = (props) => {
  const shouldShowHoursLabel = useMemo(
    () =>
      [ChartPeriod.ONE_HOUR, ChartPeriod.ONE_DAY, ChartPeriod.SEVEN_DAYS].includes(
        props.selectedPeriod,
      ),
    [props.selectedPeriod],
  );
  const chartData = useChartData();
  const [state, setState] = useState(t('chart.price'));

  const formatDateWrapper = useCallback(
    (text: string) => {
      if (!text) {
        setState(t('chart.price'));
        return;
      }
      const date = new Date(parseInt(text) * 1000);
      setState(
        format(
          date,
          `${getLocale().code === 'ru' ? 'cccccc' : 'ccc'}, dd MMM ${
            shouldShowHoursLabel ? 'HH:mm' : ''
          }`,
          { locale: getLocale() },
        ),
      );
    },
    [shouldShowHoursLabel],
  );

  useAnimatedReaction(
    () => {
      return chartData?.originalX.value;
    },
    (result, previous) => {
      if (result !== previous) {
        runOnJS(formatDateWrapper)(result);
      }
    },
    [formatDateWrapper],
  );

  return (
    <Text
      style={{ fontFamily }}
      variant="label2"
      fontWeight="500"
      color="foregroundSecondary"
    >
      {state}
    </Text>
  );
};
