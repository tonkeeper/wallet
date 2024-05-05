import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useBottomSheetInternal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../styles';

import { useSheetInternal } from '@tonkeeper/router';

export type SheetModalFooterProps = {
  children?: React.ReactNode;
  relative?: boolean;
  style?: ViewStyle;
  height?: number;
  alternateBackground?: boolean;
};

export const SheetModalFooter = React.memo((props: SheetModalFooterProps) => {
  const { style, children, height, relative, alternateBackground } = props;
  const safeArea = useSafeAreaInsets();
  const theme = useTheme();

  const {
    animatedContainerHeight,
    animatedContentHeight,
    animatedPosition,
    animatedIndex,
  } = useBottomSheetInternal();

  const { footerHeight, measureFooter } = useSheetInternal();

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const containerHeight = animatedContainerHeight.value;
    const contentHeight = animatedContentHeight.value - footerHeight.value;
    const position = animatedPosition.value;

    const footerTranslateY = Math.max(0, containerHeight - position) - footerHeight.value;

    const value =
      animatedIndex.value < 0
        ? Math.max(contentHeight, footerTranslateY)
        : Math.max(0, footerTranslateY);

    const translateY = value > 0 ? value : -999;

    return { transform: [{ translateY }] };
  });

  const contentStyle = {
    paddingBottom: safeArea.bottom,
    backgroundColor: alternateBackground
      ? theme.backgroundPageAlternate
      : theme.backgroundPage,
    height,
  };

  const containerStyle = !relative
    ? [styles.absolute, containerAnimatedStyle]
    : undefined;

  return (
    <Animated.View
      pointerEvents="box-none"
      onLayout={measureFooter}
      style={containerStyle}
    >
      <View style={[style, contentStyle]}>{children}</View>
    </Animated.View>
  );
});

SheetModalFooter.displayName = 'BottomSheetModalFooter';

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
