import React, { useMemo, useState } from 'react';
import { Text } from '$uikit/Text/Text';
import { useChartData } from '@rainbow-me/animated-charts';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { formatFiatCurrencyAmount } from '$utils/currency';
import { FiatCurrencies } from '$shared/constants';

export const Rate: React.FC<{ latestPoint: number; fiatRate: number; fiatCurrency: FiatCurrencies }> = (props) => {
    const chartData = useChartData();
    const [activePoint, setActivePoint] = useState(props.latestPoint);
    const formattedLatestPrice = useMemo(() => formatFiatCurrencyAmount((activePoint * props.fiatRate).toFixed(2), props.fiatCurrency), [props.fiatCurrency, props.fiatRate, activePoint]);
    

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
    }, []);

    return (
        <Text color='foregroundPrimary' variant='h3'>{formattedLatestPrice}</Text>
    )
}