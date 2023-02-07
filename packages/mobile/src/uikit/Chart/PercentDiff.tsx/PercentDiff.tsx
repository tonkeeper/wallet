import React from 'react';
import { Text } from '$uikit/Text/Text';
import { TonThemeColor } from '$styled';
import { FiatCurrencies } from '$shared/constants';
import { useTheme } from '$hooks';
import { toLocaleNumber } from '$utils';
import { formatFiatCurrencyAmount } from '$utils/currency';

export interface PercentDiffProps {
    latestPrice: number;
    firstPrice: number;
    fiatRate: number;
    fiatCurrency: FiatCurrencies;
}

export const PercentDiff: React.FC<PercentDiffProps> = (props) => {
    const theme = useTheme();
    const priceDiff = React.useMemo(() => {
        return (((props.latestPrice - props.firstPrice) / props.firstPrice) * 100).toFixed(
            2,
          );
      }, [props.latestPrice, props.firstPrice]);
    
      const fiatInfo = React.useMemo(() => {
        let percent = '0.0%';
        let color: TonThemeColor = 'foregroundSecondary';
        let amountResult: string;

        const diffInFiat = formatFiatCurrencyAmount(((props.latestPrice * parseFloat(priceDiff) / 100) * props.fiatRate).toFixed(2), props.fiatCurrency)
    
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
      }, [priceDiff, theme.colors]);
    

    return (
        <Text variant='body2' color={fiatInfo.color} >
            {fiatInfo.percent}{' '}
            <Text variant='body2' color={fiatInfo.color} style={{ opacity: 0.42 }}>
                {fiatInfo.diffInFiat}
            </Text>
        </Text>
    )
}