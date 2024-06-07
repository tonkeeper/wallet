import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { TonThemeColor } from '$styled';
import { Text } from '$uikit';
import { Trend } from '../content-providers/utils/types';

interface ListItemRateProps {
  percent?: string;
  price: string;
  trend: Trend;
}

const trend2color: { [key in Trend]: TonThemeColor } = {
  [Trend.Negative]: 'accentNegative',
  [Trend.Positive]: 'accentPositive',
  [Trend.Neutral]: 'textTertiary',
};

export const ListItemRate = memo<ListItemRateProps>((props) => (
  <Text style={styles.title} numberOfLines={1} color="textSecondary" variant="body2">
    {props.price}
    <View style={styles.spacing} />
    {!!props.percent && (
      <Text style={styles.percentText} color={trend2color[props.trend]} variant="body2">
        {props.percent}
      </Text>
    )}
  </Text>
));

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
