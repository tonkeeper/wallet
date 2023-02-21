import React, { useEffect, useState } from 'react';
import { ChartDot, ChartPath, ChartPathProvider, CurrentPositionVerticalLine } from '@rainbow-me/animated-charts';
import { Dimensions, View } from 'react-native';
import { useTheme } from '$hooks';
import { useSelector } from 'react-redux';
import { ratesRatesSelector } from '$store/rates';
import { Text } from '$uikit/Text/Text';
import { fiatCurrencySelector } from '$store/main';
import { CryptoCurrencies, FiatCurrencies } from '$shared/constants';
import { getRate } from '$hooks/useFiatRate';
import { formatFiatCurrencyAmount } from '$utils/currency';
import { PriceLabel } from './PriceLabel/PriceLabel';
import { PercentDiff } from './PercentDiff.tsx/PercentDiff';
import { PeriodSelector } from './PeriodSelector/PeriodSelector';
import { ChartPeriod } from './Chart.types';
import { Rate } from './Rate/Rate';
import { useQuery } from 'react-query';
import { loadChartData } from './Chart.api';

export const { width: SIZE } = Dimensions.get('window');
export const DEFAULT_CHART_PERIOD = ChartPeriod.ONE_DAY;

export const Chart: React.FC = () => {
    const theme = useTheme();
    const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>(DEFAULT_CHART_PERIOD);

    const { isLoading, isFetching, data } = useQuery(['chartFetch', selectedPeriod], () => loadChartData(selectedPeriod));

    const [cachedData, setCachedData] = useState([]);

    useEffect(() => {
        if (data) {
            setCachedData(data.data);
        }
    }, [data])

    const rates = useSelector(ratesRatesSelector);
    const fiatCurrency = useSelector(fiatCurrencySelector);

    const fiatRate =
    fiatCurrency === FiatCurrencies.Usd
      ? 1
      : getRate(rates, CryptoCurrencies.Usdt, fiatCurrency);
      
    const [max, min] = React.useMemo(() => {
        if (!cachedData.length) return [0, 0];
        const mappedPoints = cachedData.map(o => o.y);
        return [
            Math.max(...mappedPoints), Math.min(...mappedPoints)
        ].map(value => formatFiatCurrencyAmount((value * fiatRate).toFixed(2), fiatCurrency));
    }, [fiatCurrency, cachedData]);

    const [firstPoint, latestPoint] = React.useMemo(() => {
        if (!cachedData.length) return [0, 0];
        const latest = cachedData[cachedData.length - 1].y;
        const first = cachedData[0].y;
        return [first, latest];
    }, [cachedData]);

    if (isLoading && !cachedData) return null;

    return (
        <View>
            <View>
                <ChartPathProvider data={{ points: cachedData }}>
                    <View style={{ paddingHorizontal: 28 }}>
                        {latestPoint ? <Rate fiatCurrency={fiatCurrency} fiatRate={fiatRate} latestPoint={latestPoint} /> : null}
                        {latestPoint ? <PercentDiff fiatCurrency={fiatCurrency} fiatRate={fiatRate} latestPoint={latestPoint} firstPoint={firstPoint} /> : null}
                        <PriceLabel selectedPeriod={selectedPeriod} />
                    </View>
                    <View style={{ paddingVertical: 15 }}>
                        <View>
                            <ChartPath 
                                gradientEnabled 
                                longPressGestureHandlerProps={{ minDurationMs: 90 }} 
                                hapticsEnabled 
                                strokeWidth={2} 
                                selectedStrokeWidth={2}
                                height={190} 
                                stroke={theme.colors.accentPrimaryLight}
                                width={SIZE}
                                selectedOpacity={1}
                            />
                            <ChartDot size={40} style={{ backgroundColor: 'rgba(69,174,245,0.24)', alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{ height: 16, width: 16, backgroundColor: theme.colors.accentPrimaryLight, borderRadius: 8 }} />
                            </ChartDot>
                            <CurrentPositionVerticalLine thickness={2} strokeDasharray={0} length={230} color={theme.colors.accentPrimaryLight} />
                        </View>
                    </View>
                </ChartPathProvider>
                <View style={{ position: 'absolute', right: 18, bottom: 24 }}>
                    <Text style={{ fontFamily: 'SFMono-Medium' }} variant='label3' color='foregroundSecondary'>{min}</Text>
                </View>
                <View style={{ position: 'absolute', right: 18, top: 68 }}>
                    <Text style={{ fontFamily: 'SFMono-Medium' }} variant='label3' color='foregroundSecondary'>{max}</Text>
                </View>
            </View>
            <PeriodSelector disabled={isLoading || isFetching} selectedPeriod={selectedPeriod} onSelect={setSelectedPeriod} />
        </View>
    )
}