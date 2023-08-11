import { AccountEventDestination } from '@tonkeeper/core/src/TonAPI';
import { View, StyleSheet } from 'react-native';
import { formatter } from '../../../formatter';
import { Text } from '@tonkeeper/uikit';
import { memo, useMemo } from 'react';

import { useTokenPrice } from '@tonkeeper/mobile/src/hooks/useTokenPrice';
import { fiatCurrencySelector } from '@tonkeeper/mobile/src/store/main';
import { useSelector } from 'react-redux';

interface DetailedAmountProps {
  destination: AccountEventDestination;
  amount?: number | string;
  jettonAddress?: string;
  hideFiat?: boolean;
  decimals?: number;
  symbol?: string;
}

export const DetailedAmount = memo<DetailedAmountProps>((props) => {
  const {
    amount: nanoAmount,
    symbol = 'TON',
    hideFiat,
    decimals,
    destination,
    jettonAddress,
  } = props;

  const fiatCurrency = useSelector(fiatCurrencySelector);
  const tokenPrice = useTokenPrice(jettonAddress ?? 'ton');

  const amount = useMemo(() => {
    if (nanoAmount) {
      return formatter.formatNano(nanoAmount, {
        formatDecimals: decimals ?? 9,
        prefix: destination === 'in' ? '+' : '-',
        withoutTruncate: true,
        postfix: symbol,
      });
    }
  }, [destination, nanoAmount, decimals, symbol]);

  const fiatAmount = useMemo(() => {
    if (nanoAmount && tokenPrice.fiat) {
      const amount = parseFloat(formatter.fromNano(nanoAmount));
      return formatter.format(tokenPrice.fiat * amount, {
        currency: fiatCurrency,
      });
    }
  }, [nanoAmount, tokenPrice.fiat, fiatCurrency]);

  return (
    <View style={styles.container}>
      {amount && (
        <Text type="h2" style={styles.amountText}>
          {amount}
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
