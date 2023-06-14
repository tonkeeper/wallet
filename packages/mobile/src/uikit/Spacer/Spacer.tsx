import { ns } from '$utils';
import React, { FC, memo } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

export type SpacerSizes = 2 | 4 | 8 | 12 | 14 | 16 | 20 | 24 | 32 | 40;

const sizes: SpacerSizes[] = [2, 4, 8, 12, 14, 16, 20, 24, 32, 40];

interface Props extends ViewProps {
  x?: SpacerSizes;
  y?: SpacerSizes;
}

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

const SpacerComponent: FC<Props> = (props) => {
  const { x, y, style, ...viewProps } = props;

  return <View style={[x && xStyles[x], y && yStyles[y], style]} {...viewProps} />;
};

export const Spacer = memo(SpacerComponent);
