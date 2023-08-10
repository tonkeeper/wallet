import React from 'react';
import { Dimensions } from 'react-native';
import { BottomSheetScrollView as DefaultSheetModalScrollView } from '@gorhom/bottom-sheet';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomSheetScrollViewProps,
  BottomSheetScrollViewMethods,
} from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/types';
import { isAndroid, StatusBarHeight } from '../../../utils';

import { useSheetInternal } from '@tonkeeper/router';

const screenHeight = Dimensions.get('window').height;

export type SheetModalScrollViewProps = BottomSheetScrollViewProps;
export type SheetModalScrollViewRef = BottomSheetScrollViewMethods;

export const SheetModalScrollView = React.forwardRef<
  SheetModalScrollViewRef,
  SheetModalScrollViewProps
>((props, ref) => {
  const { children, safeArea, ...rest } = props;
  const { measureContent, contentHeight, footerHeight, headerHeight } =
    useSheetInternal();
  const _safeArea = useSafeAreaInsets();

  const containerStyle = useAnimatedStyle(() => {
    const topOffset = isAndroid ? StatusBarHeight : _safeArea.top;
    const maxHeight = screenHeight - topOffset - footerHeight.value;

    return { height: Math.min(contentHeight.value, maxHeight) };
  });

  const contentContainerStyle = useAnimatedStyle(() => {
    const topOffset = isAndroid ? StatusBarHeight : _safeArea.top;
    const heightToAddSpacing =
      screenHeight - topOffset - footerHeight.value - headerHeight.value;

    const safeIndent = safeArea ? _safeArea.bottom : 0;
    // adds padding to compensate header height
    return {
      paddingBottom:
        (contentHeight.value >= heightToAddSpacing ? headerHeight.value : 0) + safeIndent,
    };
  });

  return (
    <Animated.View style={containerStyle}>
      <DefaultSheetModalScrollView ref={ref} {...rest} showsVerticalScrollIndicator={false}>
        <Animated.View style={contentContainerStyle} onLayout={measureContent}>
          {children}
        </Animated.View>
      </DefaultSheetModalScrollView>
    </Animated.View>
  );
});
