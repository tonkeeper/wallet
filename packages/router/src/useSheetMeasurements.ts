import { SharedValue, useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { INITIAL_SNAP_POINT } from '@gorhom/bottom-sheet/src/components/bottomSheet/constants';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useCallback } from 'react';

export type LayoutMeasurementEvent = {
  nativeEvent: {
    layout: {
      height: number;
    };
  };
};

export type SheetMeasurements = {
  measureHeader: (ev: LayoutMeasurementEvent) => void;
  measureContent: (ev: LayoutMeasurementEvent) => void;
  measureFooter: (ev: LayoutMeasurementEvent) => void;
  scrollHandler: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollY: SharedValue<number>;
  snapPoints: SharedValue<(string | number)[]>;
  handleHeight: SharedValue<number>;
  headerHeight: SharedValue<number>;
  contentHeight: SharedValue<number>;
  footerHeight: SharedValue<number>;
};

export const useSheetMeasurements = (): SheetMeasurements => {
  const handleHeight = useSharedValue(0);
  const headerHeight = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const footerHeight = useSharedValue(0);

  const scrollY = useSharedValue(0);

  const scrollHandler = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  }, []);

  const snapPoints = useDerivedValue(() => {
    if (contentHeight.value === 0) {
      return [INITIAL_SNAP_POINT];
    }

    const content = headerHeight.value + contentHeight.value + footerHeight.value;
    return [content]; // [INITIAL_SNAP_POINT, contentHeight];
  });

  const measureHeader = (ev: LayoutMeasurementEvent) => {
    headerHeight.value = ev.nativeEvent.layout.height;
  };

  const measureContent = (ev: LayoutMeasurementEvent) => {
    contentHeight.value = ev.nativeEvent.layout.height;
  };

  const measureFooter = (ev: LayoutMeasurementEvent) => {
    footerHeight.value = ev.nativeEvent.layout.height;
  };

  return {
    measureHeader,
    measureContent,
    measureFooter,
    scrollHandler,
    scrollY,
    handleHeight,
    headerHeight,
    contentHeight,
    footerHeight,
    snapPoints,
  };
};
