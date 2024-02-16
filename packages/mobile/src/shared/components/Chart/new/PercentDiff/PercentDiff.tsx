import React, { useEffect } from 'react';
import { Text } from '$uikit/Text/Text';
import { TonThemeColor } from '$styled';
import { WalletCurrency } from '$shared/constants';
import { toLocaleNumber } from '$utils';
import { formatFiatCurrencyAmount } from '$utils/currency';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { useChartData } from '@rainbow-me/animated-charts';
import { Platform } from 'react-native';

export interface PercentDiffProps {
  latestPoint: number;
  firstPoint: number;
  fiatCurrency: WalletCurrency;
}

const fontFamily = Platform.select({
  ios: 'SFMono-Medium',
  android: 'RobotoMono-Medium',
});

const PercentDiffComponent: React.FC<PercentDiffProps> = (props) => {
  const chartData = useChartData();
  const [activePoint, setActivePoint] = React.useState(props.latestPoint);

  const priceDiffNumber = React.useMemo(() => {
    return props.firstPoint
      ? ((activePoint - props.firstPoint) / props.firstPoint) * 100
      : 0;
  }, [activePoint, props.firstPoint]);

  const priceDiff = React.useMemo(() => {
    return priceDiffNumber.toFixed(2);
  }, [priceDiffNumber]);

  useEffect(() => {
    setActivePoint(props.latestPoint);
  }, [props.latestPoint]);

  const fiatInfo = React.useMemo(() => {
    let percent = '0 %';
    let color: TonThemeColor = 'foregroundSecondary';

    const diffInFiat = formatFiatCurrencyAmount(
      Math.abs((props.firstPoint * parseFloat(priceDiff)) / 100).toFixed(2),
      props.fiatCurrency,
      true,
    );

    if (priceDiffNumber === 0) {
      return {
        percent,
        color,
        diffInFiat,
      };
    }

    percent =
      priceDiff === null
        ? '-'
        : (+priceDiff > 0 ? '+ ' : '- ') + Math.abs(Number(priceDiff)) + ' %';
    if (priceDiff !== null && priceDiff !== diffInFiat) {
      color = +priceDiff > 0 ? 'accentPositive' : 'accentNegative';
    }

    percent = toLocaleNumber(percent);

    return {
      percent,
      diffInFiat,
      color,
    };
  }, [props.firstPoint, props.fiatCurrency, priceDiff, priceDiffNumber]);

  const formatPriceWrapper = (point: number) => {
    if (!point) {
      setActivePoint(props.latestPoint);
      return;
    }
    setActivePoint(point);
  };

  useAnimatedReaction(
    () => {
      return chartData?.originalY.value;
    },
    (result, previous) => {
      if (result !== previous) {
        runOnJS(formatPriceWrapper)(result);
      }
    },
    [props.latestPoint],
  );

  return (
    <Text variant="body2" color={fiatInfo.color} style={{ fontFamily }}>
      {fiatInfo.percent}{' '}
      <Text
        variant="body2"
        color={fiatInfo.color}
        style={{ opacity: 0.42, fontFamily, marginLeft: 8 }}
      >
        {fiatInfo.diffInFiat}
      </Text>
    </Text>
  );
};

export const PercentDiff = React.memo(PercentDiffComponent);
