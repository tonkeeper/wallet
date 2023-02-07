import React, { useState } from 'react';
import { ChartDot, ChartPath, ChartPathProvider, monotoneCubicInterpolation, CurrentPositionVerticalLine } from '@rainbow-me/animated-charts';
import { Dimensions, View } from 'react-native';
import { useTheme } from '$hooks';
import { useSelector } from 'react-redux';
import { ratesChartsSelector, ratesRatesSelector } from '$store/rates';
import { Text } from '$uikit/Text/Text';
import { fiatCurrencySelector } from '$store/main';
import { CryptoCurrencies, FiatCurrencies } from '$shared/constants';
import { getRate } from '$hooks/useFiatRate';
import { formatFiatCurrencyAmount } from '$utils/currency';
import { PriceLabel } from './PriceLabel/PriceLabel';
import { PercentDiff } from './PercentDiff.tsx/PercentDiff';
import { PeriodSelector } from './PeriodSelector/PeriodSelector';
import { ChartPeriod } from './Chart.types';

export const { width: SIZE } = Dimensions.get('window');

export const Chart: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>(ChartPeriod.ONE_MONTH);

    const charts = useSelector(ratesChartsSelector);
    const rates = useSelector(ratesRatesSelector);
    const fiatCurrency = useSelector(fiatCurrencySelector);

    const data = charts.ton;

    const fiatRate =
    fiatCurrency === FiatCurrencies.Usd
      ? 1
      : getRate(rates, CryptoCurrencies.Usdt, fiatCurrency);
      
    const [max, min] = React.useMemo(() => {
        const mappedPoints = charts.ton.map(o => o.y);
        return [
            Math.max(...mappedPoints), Math.min(...mappedPoints)
        ].map(value => formatFiatCurrencyAmount((value * fiatRate).toFixed(2), fiatCurrency));
    }, [fiatCurrency, rates]);

    const [firstPoint, latestPoint] = React.useMemo(() => {
        const latest = charts.ton[charts.ton.length - 1].y;
        const first = charts.ton[0].y;
        return [first, latest];
    }, [charts.ton]);
    
    const [firstRate, latestRate] = React.useMemo(() => {
        return [firstPoint, latestPoint].map((value) => formatFiatCurrencyAmount((value * fiatRate).toFixed(2), fiatCurrency));
    }, [fiatCurrency, latestPoint, firstPoint]);
      
    const points = monotoneCubicInterpolation({data, range: 40});
    const theme = useTheme();

    return (
        <View>
             <View style={{ paddingHorizontal: 28 }}>
                <Text color='foregroundPrimary' variant='h3'>{latestRate}</Text>
                <PercentDiff fiatCurrency={fiatCurrency} fiatRate={fiatRate} latestPrice={latestPoint} firstPrice={firstPoint} />
                <PriceLabel />
            </View>
            <View>
                <ChartPathProvider data={{ points }}>
                    <ChartPath hapticsEnabled strokeWidth={2} height={230} stroke={theme.colors.accentPrimaryLight} width={SIZE} />
                    <ChartDot size={40} style={{ backgroundColor: 'rgba(69,174,245,0.24)', alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ height: 16, width: 16, backgroundColor: theme.colors.accentPrimaryLight, borderRadius: 8 }} />
                    </ChartDot>
                    <CurrentPositionVerticalLine thickness={1} strokeDasharray={0} length={230} color={theme.colors.accentPrimaryLight} />
                </ChartPathProvider>
                <View style={{ position: 'absolute', right: 16, bottom: 18 }}>
                    <Text variant='label3' color='foregroundSecondary'>{min}</Text>
                </View>
                <View style={{ position: 'absolute', right: 16, top: 18 }}>
                    <Text variant='label3' color='foregroundSecondary'>{max}</Text>
                </View>
            </View>
            <PeriodSelector selectedPeriod={selectedPeriod} onSelect={setSelectedPeriod} />
        </View>
    )
}