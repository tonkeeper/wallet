import React, { memo, useMemo } from 'react';
import { Steezy, StyleProp } from '$styles';
import { View } from '$uikit';
import { ListHeader } from './ListHeader';
import { ListSeparator } from './ListSeparator';
import { ViewStyle } from 'react-native';

interface ListProps {
  headerTitle?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const List = memo<ListProps>((props) => {
  const items = useMemo(() => {
    return React.Children.map(props.children, (node, i) => {
      if (!React.isValidElement(node)) {
        return node;
      }

      const child = node as React.ReactElement;
      return (
        <>
          {i > 0 && <ListSeparator />}
          {React.cloneElement(child)}
        </>
      );
    });
  }, [props.children]);


  return (
    <>
      {props.headerTitle && (
        <ListHeader title={props.headerTitle} />
      )}
      <View style={[styles.container, props.style]}>
        {items}
      </View>
    </>
  )
});

const styles = Steezy.create(({ radius, colors }) => ({
  container: {
    marginBottom: 32,
    overflow: 'hidden',
    borderRadius: radius.normal,
    backgroundColor: colors.backgroundContent
  }
}));