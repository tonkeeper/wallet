import React from 'react';
import { FlatList, FlatListProps, LayoutChangeEvent } from 'react-native';
import Animated, { ILayoutAnimationBuilder } from 'react-native-reanimated';

const ReanimatedFlatList = Animated.createAnimatedComponent(FlatList);

const createCellRenderer = (itemLayoutAnimation?: ILayoutAnimationBuilder) => {
  const cellRenderer: React.FC<{
    onLayout: (event: LayoutChangeEvent) => void;
  }> = (props) => {
    return (
      <Animated.View layout={itemLayoutAnimation as never} onLayout={props.onLayout}>
        {props.children}
      </Animated.View>
    );
  };

  return cellRenderer;
};

interface ReanimatedFlatlistProps<T> extends FlatListProps<T> {
  itemLayoutAnimation?: ILayoutAnimationBuilder;
}

// https://github.com/software-mansion/react-native-reanimated/pull/3216
export const AnimatedFlatList = React.forwardRef<FlatList, ReanimatedFlatlistProps<any>>(
  ({ itemLayoutAnimation, ...restProps }, ref) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const cellRenderer = React.useMemo(() => createCellRenderer(itemLayoutAnimation), []);

    return (
      <ReanimatedFlatList ref={ref} {...restProps} CellRendererComponent={cellRenderer} />
    );
  },
);
