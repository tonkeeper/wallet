import React, { useMemo } from 'react';
import {
  ChartDot,
  ChartPath,
  ChartPathProvider,
  CurrentPositionVerticalLine,
} from '@rainbow-me/animated-charts';
import { Dimensions, View } from 'react-native';
import { useTheme } from '$hooks/useTheme';
import { PriceLabel } from './PriceLabel/PriceLabel';
import { ChartYLabels } from './ChartYLabels/ChartYLabels';
import { changeAlphaValue, convertHexToRGBA, ns } from '$utils';
import { ChartXLabels } from './ChartXLabels/ChartXLabels';
import { ChartPeriod } from '$store/zustand/chart';
import { formatter } from '@tonkeeper/shared/formatter';
import { JettonBalanceModel } from '$store/models';

export const { width: SIZE } = Dimensions.get('window');

interface Props {
  stakingJetton: JettonBalanceModel;
}

const ChartComponent: React.FC<Props> = (props) => {
  const { stakingJetton } = props;

  const theme = useTheme();
  const chart = [];

  const selectedPeriod = useMemo(() => {
    if (chart.length === 7) {
      return ChartPeriod.SEVEN_DAYS;
    }

    return ChartPeriod.ONE_MONTH;
  }, [chart.length]);

  const shouldRenderChart = !!chart.length;

  const [maxPrice, minPrice] = React.useMemo(() => {
    if (!chart.length) {
      return ['0', '0'];
    }
    const mappedPoints = chart.map((o) => o.y);
    return [Math.max(...mappedPoints), Math.min(...mappedPoints)].map((value) =>
      formatter.format(value, { currency: 'TON' }),
    );
  }, [chart]);

  const [firstPoint, latestPoint] = React.useMemo(() => {
    if (!chart.length) {
      return [0, 0];
    }
    const latest = chart[chart.length - 1].y;
    const first = chart[0].y;
    return [first, latest];
  }, [chart]);

  if (!chart) {
    return null;
  }

  return (
    <View>
      <View>
        <ChartPathProvider
          data={{
            points: chart,
          }}
        >
          <View style={{ paddingHorizontal: 28 }}>
            <PriceLabel selectedPeriod={selectedPeriod} />
          </View>
          <View style={{ paddingVertical: 30 }}>
            <View>
              <ChartPath
                __disableRendering={!shouldRenderChart}
                gradientEnabled
                longPressGestureHandlerProps={{ minDurationMs: 90 }}
                hapticsEnabled
                strokeWidth={2}
                selectedStrokeWidth={2}
                height={ns(160)}
                stroke={theme.colors.accentPositive}
                width={SIZE - 1}
                selectedOpacity={1}
              >
                {/* <Fallback isError={isError} /> */}
              </ChartPath>
              <ChartDot
                size={40}
                style={{
                  backgroundColor: changeAlphaValue(
                    convertHexToRGBA(theme.colors.accentPositive),
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
                    backgroundColor: theme.colors.accentPositive,
                    borderRadius: 8,
                  }}
                />
              </ChartDot>
              <CurrentPositionVerticalLine
                thickness={2}
                strokeDasharray={0}
                length={170}
                color={theme.colors.accentPositive}
              />
            </View>
          </View>
          <ChartYLabels maxPrice={maxPrice} minPrice={minPrice} />
          <ChartXLabels currentPeriod={selectedPeriod} />
        </ChartPathProvider>
      </View>
    </View>
  );
};

export const StakingChart = React.memo(ChartComponent);
