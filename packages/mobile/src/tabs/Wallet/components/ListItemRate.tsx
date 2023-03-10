import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { TonThemeColor } from '$styled';
import { Text } from '$uikit';

interface ListItemRateProps {
  percent?: string;
  price: string;
  trend: string;
}

const trend2color: { [key: string]: TonThemeColor } = {
  negative: 'accentNegative',
  positive: 'accentPositive',
  unknown: 'textSecondary'
};

export const ListItemRate = memo<ListItemRateProps>((props) => (
  <View style={styles.subvalue}>
    <Text
      color="textSecondary"
      style={{ marginRight: 6 }}
      variant="body2"
    >
      {props.price}
    </Text>
    {!!props.percent && (
      <Text
        color={trend2color[props.trend]}
        variant="body2"
      >
        {props.percent}
      </Text>
    )}
  </View>
));

const styles = StyleSheet.create({
  subvalue: {
    flexDirection: 'row'
  }
});