import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Text } from '$uikit/Text/Text';
import { useChartData } from '@rainbow-me/animated-charts';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { formatFiatCurrencyAmount } from '$utils/currency';
import { Platform } from 'react-native';
import { WalletCurrency } from '@tonkeeper/core';

const fontFamily = Platform.select({
  ios: 'SFMono-Bold',
  android: 'RobotoMono-Bold',
});

const RateComponent: React.FC<{
  latestPoint: number;
  fiatRate: number;
  fiatCurrency: WalletCurrency;
}> = (props) => {
  const chartData = useChartData();
  const [activePoint, setActivePoint] = useState(props.latestPoint);
  const formattedLatestPrice = useMemo(
    () =>
      formatFiatCurrencyAmount(
        (activePoint * props.fiatRate).toFixed(4),
        props.fiatCurrency,
        true,
      ),
    [props.fiatCurrency, props.fiatRate, activePoint],
  );

  const formatPriceWrapper = useCallback(
    (point: number) => {
      if (!point) {
        setActivePoint(props.latestPoint);
        return;
      }
      setActivePoint(point);
    },
    [props.latestPoint],
  );

  useEffect(() => {
    setActivePoint(props.latestPoint);
  }, [props.latestPoint]);

  useAnimatedReaction(
    () => {
      return chartData?.originalY.value;
    },
    (result, previous) => {
      if (result !== previous) {
        runOnJS(formatPriceWrapper)(result);
      }
    },
    [formatPriceWrapper],
  );

  return (
    <Text style={{ fontFamily }} color="foregroundPrimary" variant="h3">
      {formattedLatestPrice}
    </Text>
  );
};

export const Rate = React.memo(RateComponent);
