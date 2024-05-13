import { StyleSheet, View, ViewProps } from 'react-native';
import { ns } from '../utils';
import { memo } from 'react';

export type SpacerSizes = 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 20 | 24 | 32 | 48;

const sizes: SpacerSizes[] = [2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 48];

interface SpacerProps extends ViewProps {
  x?: SpacerSizes;
  y?: SpacerSizes;
}

export const Spacer = memo<SpacerProps>((props) => {
  const { x, y, style, ...viewProps } = props;

  return <View style={[x && xStyles[x], y && yStyles[y], style]} {...viewProps} />;
});

const xStyles = StyleSheet.create(
  (() =>
    sizes.reduce((acc, size) => {
      acc[size] = {
        marginLeft: ns(size),
      };

      return acc;
    }, {}))(),
);
const yStyles = StyleSheet.create(
  (() =>
    sizes.reduce((acc, size) => {
      acc[size] = {
        marginBottom: ns(size),
      };

      return acc;
    }, {}))(),
);
