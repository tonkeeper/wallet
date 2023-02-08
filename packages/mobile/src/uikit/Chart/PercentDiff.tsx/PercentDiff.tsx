import React, { useEffect } from 'react';
import { Text } from '$uikit/Text/Text';
import { TonThemeColor } from '$styled';
import { FiatCurrencies } from '$shared/constants';
import { useTheme } from '$hooks';
import { toLocaleNumber } from '$utils';
import { formatFiatCurrencyAmount } from '$utils/currency';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { useChartData } from '@rainbow-me/animated-charts';

export interface PercentDiffProps {
    latestPoint: number;
    firstPoint: number;
    fiatRate: number;
    fiatCurrency: FiatCurrencies;
}

export const PercentDiff: React.FC<PercentDiffProps> = (props) => {
    const chartData = useChartData();
    const theme = useTheme();
    const [activePoint, setActivePoint] = React.useState(props.latestPoint);

    const priceDiff = React.useMemo(() => {
        return (((activePoint - props.firstPoint) / props.firstPoint) * 100).toFixed(
            2,
          );
    }, [activePoint, props.firstPoint]);

    useEffect(() => {
      setActivePoint(props.latestPoint);
    }, [props.latestPoint]);
    
      const fiatInfo = React.useMemo(() => {
        let percent = '0.0%';
        let color: TonThemeColor = 'foregroundSecondary';
        let amountResult: string;

        const diffInFiat = formatFiatCurrencyAmount(((activePoint * parseFloat(priceDiff) / 100) * props.fiatRate).toFixed(2), props.fiatCurrency)
    
        percent = priceDiff === null ? '-' : (+priceDiff > 0 ? '+ ' : '– ') + Math.abs(Number(priceDiff)) + '%';
        if (priceDiff !== null) {
          color = +priceDiff > 0 ? 'accentPositive' : 'accentNegative';
        }
    
        percent = toLocaleNumber(percent);
    
        return {
          percent,
          diffInFiat,
          color,
        };
      }, [priceDiff, theme.colors, activePoint]);

      const formatPriceWrapper = (point: number) => {
        if (!point) {
            setActivePoint(props.latestPoint);
            return;
        }
        setActivePoint(point);
      };

      useAnimatedReaction(() => {
          return chartData?.originalY.value;
      }, (result, previous) => {
          if (result !== previous) {
            runOnJS(formatPriceWrapper)(result);
          }
      }, [props.latestPoint]);
    

    return (
        <Text variant='body2' color={fiatInfo.color} >
            {fiatInfo.percent}{' '}
            <Text variant='body2' color={fiatInfo.color} style={{ opacity: 0.42 }}>
                {fiatInfo.diffInFiat}
            </Text>
        </Text>
    )
}