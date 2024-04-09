import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Dimensions } from 'react-native';
import React from 'react';
import { DarkTheme } from '@tonkeeper/uikit/src/styles/themes/dark';
import { Steezy, View } from '@tonkeeper/uikit';

const setStopPoints = () => {
  let stopPoints = [
    0, 0.0666667, 0.133333, 0.2, 0.266667, 0.333333, 0.4, 0.466667, 0.533333, 0.6,
    0.666667, 0.733333, 0.8, 0.866667, 0.933333, 1,
  ];

  return stopPoints.map((offset, index) => (
    <Stop
      key={index}
      offset={offset}
      stopColor={DarkTheme.backgroundContent}
      stopOpacity={1 - index * 0.0625}
    />
  ));
};

const svgWidth = Dimensions.get('window').width - 32;
const lineWidth = svgWidth - 56 * 2;
const verticalLinesXOffset = svgWidth / 3;

export function Separators({ oneRow }: { oneRow?: boolean }) {
  if (oneRow) {
    return (
      <View style={styles.separatorsContainerOneRow}>
        <SeparatorsOneRow />
      </View>
    );
  }

  return (
    <View style={styles.separatorsContainerTwoRows}>
      <SeparatorsTwoRows />
    </View>
  );
}

function Gradients() {
  return (
    <Defs>
      <LinearGradient
        id="gradientHorizontal"
        x1="1"
        y1="0"
        x2="0"
        y2="0"
        gradientUnits="objectBoundingBox"
      >
        {setStopPoints()}
      </LinearGradient>
      <LinearGradient
        id="gradientHorizontalReversed"
        x1="0"
        x2="1"
        gradientUnits="objectBoundingBox"
      >
        {setStopPoints()}
      </LinearGradient>
      <LinearGradient
        id="gradientVertical"
        y1="1"
        y2="0"
        gradientUnits="objectBoundingBox"
      >
        {setStopPoints()}
      </LinearGradient>
      <LinearGradient
        id="gradientVerticalReversed"
        y1="0"
        y2="1"
        gradientUnits="objectBoundingBox"
      >
        {setStopPoints()}
      </LinearGradient>
    </Defs>
  );
}

function SeparatorsTwoRows() {
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
        fill={DarkTheme.backgroundContent}
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
        fill={DarkTheme.backgroundContent}
      />
      <Rect
        x={verticalLinesXOffset}
        y="56"
        width="0.5"
        height="32"
        fill={DarkTheme.backgroundContent}
      />
      <Rect
        x={verticalLinesXOffset}
        y="88"
        width="0.5"
        height="24"
        fill={'url(#gradientVerticalReversed)'}
      />
      <Rect x={verticalLinesXOffset * 2} y="56" width="0.5" height="32" fill="#1D2633" />
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
        fill={DarkTheme.backgroundContent}
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

function SeparatorsOneRow() {
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
        fill={DarkTheme.backgroundContent}
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
        fill={DarkTheme.backgroundContent}
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
