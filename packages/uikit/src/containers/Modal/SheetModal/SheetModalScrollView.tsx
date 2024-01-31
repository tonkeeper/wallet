import React, { useState } from 'react';
import { Dimensions, View } from 'react-native';
import { BottomSheetScrollView as DefaultSheetModalScrollView } from '@gorhom/bottom-sheet';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
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
  const { measureContent, scrollHandler, contentHeight, footerHeight, headerHeight } =
    useSheetInternal();
  const _safeArea = useSafeAreaInsets();

  const containerStyle = useAnimatedStyle(() => {
    const topOffset = isAndroid ? StatusBarHeight : _safeArea.top;
    const maxHeight = screenHeight - topOffset - footerHeight.value;

    return { height: Math.min(contentHeight.value, maxHeight) };
  });

  const bottomInset = _safeArea.bottom;
  const topInset = _safeArea.top;

  const [spacing, setSpacing] = useState(0);

  useAnimatedReaction(
    () => {
      const topOffset = isAndroid ? StatusBarHeight : topInset;
      const heightToAddSpacing =
        screenHeight - topOffset - footerHeight.value - headerHeight.value;

      return contentHeight.value >= heightToAddSpacing ? headerHeight.value : 0;
    },
    (result, previous) => {
      if (result !== previous) {
        runOnJS(setSpacing)(result);
      }
    },
  );

  return (
    <Animated.View style={containerStyle}>
      <DefaultSheetModalScrollView
        ref={ref}
        {...rest}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
      >
        <View style={{ paddingBottom: spacing }}>
          <View
            onLayout={measureContent}
            style={{ paddingBottom: safeArea ? bottomInset : 0 }}
          >
            {children}
          </View>
        </View>
      </DefaultSheetModalScrollView>
    </Animated.View>
  );
});
