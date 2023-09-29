import { Steezy, StyleProp } from '../styles';
import { ViewStyle } from 'react-native';
import React, { memo, useMemo } from 'react';
import { View } from './View';

interface IconButtonListProps {
  horizontalIndent?: 'large' | 'small';
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const IconButtonList = memo<IconButtonListProps>((props) => {
  const { children, horizontalIndent = 'small', style } = props;
  const containerStyle = style ? [styles.container, style] : styles.container;

  const buttons = useMemo(() => {
    if (horizontalIndent === 'large') {
      return React.Children.map(props.children, (node, i) => {
        if (!React.isValidElement(node)) {
          return node;
        }

        const child = node as React.ReactElement;
        return React.cloneElement(child, { horizontalIndent });
      });
    }

    return children;
  }, [children]);

  return (
    <View style={containerStyle} pointerEvents="box-none">
      <View style={styles.buttons} pointerEvents="box-none">
        {buttons}
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
    // paddingVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
  },
});
