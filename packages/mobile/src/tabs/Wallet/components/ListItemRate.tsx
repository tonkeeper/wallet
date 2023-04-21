import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { TonThemeColor } from '$styled';
import { Spacer, Text } from '$uikit';

interface ListItemRateProps {
  percent?: string;
  price: string;
  trend: string;
}

const trend2color: { [key: string]: TonThemeColor } = {
  negative: 'accentNegative',
  positive: 'accentPositive',
  unknown: 'textSecondary',
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
