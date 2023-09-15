import { ActionDestination, ActivityActionAmount } from '@tonkeeper/core';
import { View, StyleSheet } from 'react-native';
import { formatter } from '../../../formatter';
import { Text } from '@tonkeeper/uikit';
import { memo, useMemo } from 'react';

import { useTokenPrice } from '@tonkeeper/mobile/src/hooks/useTokenPrice';
import { fiatCurrencySelector } from '@tonkeeper/mobile/src/store/main';
import { useSelector } from 'react-redux';
import { AmountFormatter } from '@tonkeeper/core';

interface DetailedAmountProps {
  destination: ActionDestination;
  amount?: ActivityActionAmount;
  jettonAddress?: string;
  hideFiat?: boolean;
  decimals?: number;
  symbol?: string;
}

export const DetailedAmount = memo<DetailedAmountProps>((props) => {
  const {
    amount,
    symbol = 'TON',
    hideFiat,
    decimals,
    destination,
    jettonAddress,
  } = props;

  const fiatCurrency = useSelector(fiatCurrencySelector);
  const tokenPrice = useTokenPrice(jettonAddress ?? 'ton');

  const formattedAmount = useMemo(() => {
    if (amount) {
      return formatter.formatNano(amount.value, {
        decimals: amount.decimals,
        postfix: amount.symbol,
        formatDecimals: 9,
        prefix:
          destination === 'in' ? AmountFormatter.sign.plus : AmountFormatter.sign.minus,
        withoutTruncate: true,
      });
    }
  }, [destination, amount, decimals, symbol]);

  const fiatAmount = useMemo(() => {
    if (amount && tokenPrice.fiat) {
      const parsedAmount = parseFloat(formatter.fromNano(amount.value, amount.decimals));
      return formatter.format(tokenPrice.fiat * parsedAmount, {
        currency: fiatCurrency,
        decimals: 9,
      });
    }
  }, [amount, tokenPrice.fiat, fiatCurrency]);

  return (
    <View style={styles.container}>
      {amount && (
        <Text type="h2" style={styles.amountText}>
          {formattedAmount}
        </Text>
      )}
      {fiatAmount && !hideFiat && (
        <Text type="body1" color="textSecondary" style={styles.fiatText}>
          {fiatAmount}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountText: {
    textAlign: 'center',
  },
  fiatText: {
    marginTop: 4,
  },
});
