import { PriceTrend, TokenPrice } from '@tonkeeper/core';
import { useCurrency } from '../../../hooks/useCurrency';
import { Text, TextColors } from '@tonkeeper/uikit';
import { StyleSheet, View } from 'react-native';
import { formatter } from '../../../formatter';
import { memo } from 'react';

interface ListItemRateProps {
  price: TokenPrice;
}

const trend2color: { [key in PriceTrend]: TextColors } = {
  [PriceTrend.Negative]: 'accentRed',
  [PriceTrend.Positive]: 'accentGreen',
  [PriceTrend.Unknown]: 'textSecondary',
};

export const ListItemRate = memo<ListItemRateProps>((props) => {
  const { price } = props;
  const currency = useCurrency();

  return (
    <Text style={styles.title} numberOfLines={1} color="textSecondary" type="body2">
      {formatter.format(price.value, { currency })}
      <View style={styles.spacing} />
      <Text
        style={styles.percentText}
        color={trend2color[price.diff_24h.trend]}
        type="body2"
      >
        {price.diff_24h.percent}
      </Text>
    </Text>
  );
});

const styles = StyleSheet.create({
  spacing: {
    width: 6,
  },
  title: {
    marginRight: 6,
  },
  percentText: {
    opacity: 0.74,
  },
});
