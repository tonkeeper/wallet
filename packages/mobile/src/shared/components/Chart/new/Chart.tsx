import React, { useEffect, useMemo, useState } from 'react';
import {
  ChartDot,
  ChartPath,
  ChartPathProvider,
  CurrentPositionVerticalLine,
  stepInterpolation,
} from '@rainbow-me/animated-charts';
import { Dimensions, View } from 'react-native';
import { useTheme } from '$hooks/useTheme';
import { useTokenPrice } from '$hooks/useTokenPrice';
import { CryptoCurrencies } from '$shared/constants';
import { formatFiatCurrencyAmount } from '$utils/currency';
import { PriceLabel } from './PriceLabel/PriceLabel';
import { PercentDiff } from './PercentDiff/PercentDiff';
import { PeriodSelector } from './PeriodSelector/PeriodSelector';
import { Rate } from './Rate/Rate';
import { useQuery } from 'react-query';
import { loadChartData } from './Chart.api';
import { ChartYLabels } from './ChartYLabels/ChartYLabels';
import { changeAlphaValue, convertHexToRGBA, ns } from '$utils';
import { ChartXLabels } from './ChartXLabels/ChartXLabels';
import { ChartPeriod, useChartStore } from '$store/zustand/chart';
import { Fallback } from './Fallback/Fallback';
import BigNumber from 'bignumber.js';
import { isIOS } from '@tonkeeper/uikit';
import { useCurrency } from '@tonkeeper/shared/hooks/useCurrency';
import { WalletCurrency } from '@tonkeeper/core';

export const { width: SIZE } = Dimensions.get('window');

const ChartComponent: React.FC = () => {
  const theme = useTheme();
  const selectedPeriod = useChartStore((state) => state.selectedPeriod);
  const setChartPeriod = useChartStore((state) => state.actions.setChartPeriod);

  const { isLoading, isFetching, data, isError } = useQuery({
    queryKey: ['chartFetch', selectedPeriod],
    queryFn: () => loadChartData(selectedPeriod),
    refetchInterval: 60 * 1000,
    staleTime: 120 * 1000,
  });

  const [cachedData, setCachedData] = useState(data?.data ?? []);

  useEffect(() => {
    if ((data && !isFetching && !isLoading) || !cachedData) {
      setCachedData(
        selectedPeriod === ChartPeriod.ONE_HOUR
          ? stepInterpolation(data.data)
          : data.data,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, selectedPeriod, isFetching, isLoading]);

  const fiatCurrency = useCurrency();
  const shouldRenderChart = !!cachedData.length;

  const tonPrice = useTokenPrice(CryptoCurrencies.Ton);

  const fiatRate = useMemo(() => {
    if (fiatCurrency === WalletCurrency.USD) {
      return 1;
    }

    return new BigNumber(tonPrice.fiat).dividedBy(tonPrice.usd).toNumber();
  }, [fiatCurrency, tonPrice.fiat, tonPrice.usd]);

  const [maxPrice, minPrice] = React.useMemo(() => {
    if (!cachedData.length) {
      return ['0', '0'];
    }
    const mappedPoints = cachedData.map((o) => o.y);
    return [Math.max(...mappedPoints), Math.min(...mappedPoints)].map((value) =>
      formatFiatCurrencyAmount((value * fiatRate).toFixed(2), fiatCurrency, true),
    );
  }, [cachedData, fiatRate, fiatCurrency]);

  const [firstPoint, latestPoint] = React.useMemo(() => {
    if (!cachedData.length) {
      return [0, 0];
    }
    const latest = cachedData[cachedData.length - 1].y;
    const first = cachedData[0].y;
    return [first, latest];
  }, [cachedData]);

  if (isLoading && !cachedData) {
    return null;
  }

  return (
    <View>
      <View>
        <ChartPathProvider
          data={{
            points: cachedData,
          }}
        >
          <View style={{ paddingHorizontal: 28 }}>
            <Rate
              fiatCurrency={fiatCurrency}
              fiatRate={fiatRate}
              latestPoint={latestPoint}
            />
            <PercentDiff
              fiatCurrency={fiatCurrency}
              fiatRate={fiatRate}
              latestPoint={latestPoint}
              firstPoint={firstPoint}
            />
            <PriceLabel selectedPeriod={selectedPeriod} />
          </View>
          <View style={{ paddingVertical: 30 }}>
            <View>
              <ChartPath
                __disableRendering={!shouldRenderChart}
                gradientEnabled
                longPressGestureHandlerProps={{ minDurationMs: 90 }}
                hapticsEnabled={isIOS}
                strokeWidth={2}
                selectedStrokeWidth={2}
                height={ns(160)}
                stroke={theme.colors.accentPrimaryLight}
                width={SIZE - 1}
                selectedOpacity={1}
              >
                <Fallback isError={isError} />
              </ChartPath>
              <ChartDot
                size={40}
                style={{
                  backgroundColor: changeAlphaValue(
                    convertHexToRGBA(theme.colors.accentPrimaryLight),
                    0.24,
                  ),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    height: 16,
                    width: 16,
                    backgroundColor: theme.colors.accentPrimaryLight,
                    borderRadius: 8,
                  }}
                />
              </ChartDot>
              <CurrentPositionVerticalLine
                thickness={2}
                strokeDasharray={0}
                length={170}
                color={theme.colors.accentPrimaryLight}
              />
            </View>
          </View>
          <ChartYLabels maxPrice={maxPrice} minPrice={minPrice} />
          <ChartXLabels currentPeriod={selectedPeriod} />
        </ChartPathProvider>
      </View>
      <PeriodSelector
        disabled={isLoading || isFetching}
        selectedPeriod={selectedPeriod}
        onSelect={setChartPeriod}
      />
    </View>
  );
};

export const Chart = React.memo(ChartComponent);
