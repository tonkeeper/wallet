import { Steezy, StyleProp } from '../styles';
import { ViewStyle } from 'react-native';
import React, { memo } from 'react';
import { View } from './View';

interface IconButtonListProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const IconButtonList = memo<IconButtonListProps>((props) => {
  const containerStyle = props.style ? [styles.container, props.style] : styles.container;

  return (
    <View style={containerStyle} pointerEvents="box-none">
      <View style={styles.buttons} pointerEvents="box-none">
        {props.children}
      </View>
    </View>
  );
});

const styles = Steezy.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttons: {
    paddingVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
  },
});
