import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Dimensions, useWindowDimensions } from 'react-native';
import React from 'react';
import { Steezy, useTheme } from '../../styles';
import { View } from '../View';

export function Separators({ numOfActions }: { numOfActions?: number }) {
  switch (numOfActions) {
    case 1:
      return null;
    case 2:
      return (
        <View style={styles.separatorsContainerOneRow}>
          <SeparatorsTwoActions />
        </View>
      );
    case 3:
      return (
        <View style={styles.separatorsContainerOneRow}>
          <SeparatorsOneRow />
        </View>
      );
    default:
      return (
        <View style={styles.separatorsContainerTwoRows}>
          <SeparatorsTwoRows />
        </View>
      );
  }
}

const getLinearGradientProps = (id) => {
  switch (id) {
    case 'gradientHorizontal':
      return { x1: '1', y1: '0', x2: '0', y2: '0', gradientUnits: 'objectBoundingBox' };
    case 'gradientHorizontalReversed':
      return { x1: '0', x2: '1', gradientUnits: 'objectBoundingBox' };
    case 'gradientVertical':
      return { y1: '1', y2: '0', gradientUnits: 'objectBoundingBox' };
    case 'gradientVerticalReversed':
      return { y1: '0', y2: '1', gradientUnits: 'objectBoundingBox' };
    default:
      return {};
  }
};

let stopPoints = [
  0, 0.0666667, 0.133333, 0.2, 0.266667, 0.333333, 0.4, 0.466667, 0.533333, 0.6, 0.666667,
  0.733333, 0.8, 0.866667, 0.933333, 1,
];

const Gradients = () => {
  const theme = useTheme();
  return (
    <Defs>
      {[
        'gradientHorizontal',
        'gradientHorizontalReversed',
        'gradientVertical',
        'gradientVerticalReversed',
      ].map((id) => (
        <LinearGradient key={id} id={id} {...getLinearGradientProps(id)}>
          {stopPoints.map((offset, index) => (
            <Stop
              key={index}
              offset={offset}
              stopColor={theme.separatorActionButtons}
              stopOpacity={1 - index * 0.0625}
            />
          ))}
        </LinearGradient>
      ))}
    </Defs>
  );
};

function SeparatorsTwoRows() {
  const svgWidth = useWindowDimensions().width - 32;
  const lineWidth = svgWidth - 56 * 2;
  const verticalLinesXOffset = svgWidth / 3;

  const theme = useTheme();
  return (
    <Svg width={svgWidth} height="112" viewBox={`0 0 ${svgWidth} 112`} fill="none">
      <Rect
        fill={'url(#gradientVertical)'}
        x={verticalLinesXOffset}
        y="0"
        width="0.5"
        height="24"
      />
      <Rect
        x={verticalLinesXOffset}
        y="24"
        width="0.5"
        height="32"
        fill={theme.separatorActionButtons}
      />
      <Rect
        x={verticalLinesXOffset * 2}
        fill={'url(#gradientVertical)'}
        y="0"
        width="0.5"
        height="24"
      />
      <Rect
        x={verticalLinesXOffset * 2}
        y="24"
        width="0.5"
        height="32"
        fill={theme.separatorActionButtons}
      />
      <Rect
        x={verticalLinesXOffset}
        y="56"
        width="0.5"
        height="32"
        fill={theme.separatorActionButtons}
      />
      <Rect
        x={verticalLinesXOffset}
        y="88"
        width="0.5"
        height="24"
        fill={'url(#gradientVerticalReversed)'}
      />
      <Rect
        x={verticalLinesXOffset * 2}
        y="56"
        width="0.5"
        height="32"
        fill={theme.separatorActionButtons}
      />
      <Rect
        x={verticalLinesXOffset * 2}
        y="88"
        width="0.5"
        height="24"
        fill={'url(#gradientVerticalReversed)'}
      />
      <Rect x="8" y="56" width="48" height="0.5" fill={'url(#gradientHorizontal)'} />
      <Rect
        x="56"
        y="56"
        width={lineWidth}
        height="0.5"
        fill={theme.separatorActionButtons}
      />
      <Rect
        x={56 + lineWidth}
        y="56"
        width="48"
        height="0.5"
        fill={'url(#gradientHorizontalReversed)'}
      />
      <Gradients />
    </Svg>
  );
}

function SeparatorsTwoActions() {
  const svgWidth = useWindowDimensions().width - 32;

  const theme = useTheme();
  return (
    <Svg width={svgWidth} height="56" viewBox={`0 0 ${svgWidth} 56`} fill="none">
      <Rect
        fill={'url(#gradientVertical)'}
        x={svgWidth / 2}
        y="0"
        width="0.5"
        height="24"
      />
      <Rect
        x={svgWidth / 2}
        y="24"
        width="0.5"
        height="8"
        fill={theme.separatorActionButtons}
      />
      <Rect
        fill={'url(#gradientVerticalReversed)'}
        x={svgWidth / 2}
        y="32"
        width="0.5"
        height="24"
      />
      <Gradients />
    </Svg>
  );
}

function SeparatorsOneRow() {
  const svgWidth = useWindowDimensions().width - 32;
  const verticalLinesXOffset = svgWidth / 3;

  const theme = useTheme();
  return (
    <Svg width={svgWidth} height="56" viewBox={`0 0 ${svgWidth} 56`} fill="none">
      <Rect
        fill={'url(#gradientVertical)'}
        x={verticalLinesXOffset}
        y="0"
        width="0.5"
        height="24"
      />
      <Rect
        x={verticalLinesXOffset}
        y="24"
        width="0.5"
        height="8"
        fill={theme.separatorActionButtons}
      />
      <Rect
        fill={'url(#gradientVerticalReversed)'}
        x={verticalLinesXOffset}
        y="32"
        width="0.5"
        height="24"
      />
      <Rect
        fill={'url(#gradientVertical)'}
        x={verticalLinesXOffset * 2}
        y="0"
        width="0.5"
        height="24"
      />
      <Rect
        x={verticalLinesXOffset * 2}
        y="24"
        width="0.5"
        height="8"
        fill={theme.separatorActionButtons}
      />
      <Rect
        fill={'url(#gradientVerticalReversed)'}
        x={verticalLinesXOffset * 2}
        y="32"
        width="0.5"
        height="24"
      />
      <Gradients />
    </Svg>
  );
}

const styles = Steezy.create({
  separatorsContainerOneRow: {
    position: 'absolute',
    top: 12,
    bottom: 12,
    left: 0,
    right: 0,
  },
  separatorsContainerTwoRows: {
    position: 'absolute',
    top: 24,
    bottom: 24,
    left: 0,
    right: 0,
  },
});
