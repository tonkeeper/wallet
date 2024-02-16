import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Text } from '$uikit/Text/Text';
import { useChartData } from '@rainbow-me/animated-charts';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { formatFiatCurrencyAmount } from '$utils/currency';
import { WalletCurrency } from '$shared/constants';
import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'SFMono-Bold',
  android: 'RobotoMono-Bold',
});

const RateComponent: React.FC<{
  latestPoint: number;
  fiatCurrency: WalletCurrency;
}> = (props) => {
  const chartData = useChartData();
  const [activePoint, setActivePoint] = useState(props.latestPoint);
  const formattedLatestPrice = useMemo(
    () =>
      formatFiatCurrencyAmount(
        activePoint.toFixed(activePoint > 0.0001 ? 4 : 8),
        props.fiatCurrency,
        true,
      ),
    [props.fiatCurrency, activePoint],
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
        runOnJS(formatPriceWrapper)(parseFloat(result));
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
