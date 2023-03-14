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
  indent?: boolean;
}

export const List = memo<ListProps>((props) => {
  const { indent = true } = props;

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
      <View style={[styles.container, props.style, indent && styles.indentHorizontal]}>
        {items}
      </View>
    </>
  )
});

const styles = Steezy.create(({ corners, colors }) => ({
  container: {
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: corners.medium,
    backgroundColor: colors.backgroundContent
  },
  indentHorizontal: {
    marginHorizontal: 16
  }
}));