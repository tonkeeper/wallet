import React, { memo, useMemo } from 'react';
import { Steezy, StyleProp } from '$styles';
import { Spacer } from '../Spacer/Spacer';
import { View } from '@tonkeeper/uikit';
import { ListHeader } from './ListHeader';
import { ListSeparator } from './ListSeparator';
import { ViewStyle } from 'react-native';

interface ListProps {
  headerTitle?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  indent?: boolean;
  compact?: boolean;
}

export const List = memo<ListProps>((props) => {
  const { indent = true, compact = true } = props;

  const items = useMemo(() => {
    return React.Children.toArray(props.children)
      .filter((node) => node != null)
      .map((node, i, arr) => {
        if (!React.isValidElement(node)) {
          return node;
        }

        const child = node as React.ReactElement;
        return (
          <View key={i}>
            {!compact && i === 0 && <Spacer y={8} />}
            {compact && i > 0 && <ListSeparator />}
            {React.cloneElement(child, {
              compact,
              isFirst: i === 0,
              // @ts-ignore
              isLast: i === props.children.length - 1,
            })}
            {/* @ts-ignore **/}
            {!compact && i === arr.length - 1 && <Spacer y={8} />}
          </View>
        );
      });
  }, [compact, props.children]);

  return (
    <>
      {props.headerTitle && <ListHeader title={props.headerTitle} />}
      <View style={[styles.container, props.style, indent && styles.indentHorizontal]}>
        {items}
      </View>
    </>
  );
});

const styles = Steezy.create(({ corners, colors }) => ({
  container: {
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: corners.medium,
    backgroundColor: colors.backgroundContent,
  },
  indentHorizontal: {
    marginHorizontal: 16,
  },
}));
