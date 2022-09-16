import React from 'react';
import Animated from 'react-native-reanimated';
import { SCROLLABLE_TYPE, useBottomSheetInternal } from '@gorhom/bottom-sheet';
import { BottomSheetViewProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetView/types';
import { useSheetInternal } from './SheetsProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type SheetContentProps = BottomSheetViewProps & { 
  disabledInertia?: boolean 
  safeArea?: boolean;
}

export const SheetContent = React.memo<SheetContentProps>((props) => {
  const {
    enableFooterMarginAdjustment = false,
    disabledInertia,
    style,
    children,
    safeArea,
    ...rest
  } = props;

  const {
    animatedScrollableContentOffsetY,
    animatedScrollableType,
  } = useBottomSheetInternal();

  const safeAreaInsets = useSafeAreaInsets();
  const { measureContent } = useSheetInternal();

  React.useEffect(() => {
    if (disabledInertia) {
      // 
    }

    animatedScrollableContentOffsetY.value = 0;
    animatedScrollableType.value = SCROLLABLE_TYPE.VIEW;
  }, []);

  const safeAreaStyle = { paddingBottom: safeAreaInsets.bottom };

  return (
    <Animated.View 
      onLayout={measureContent}
      style={[safeArea && safeAreaStyle, style]} 
      {...rest}
    >
      {children}
    </Animated.View>
  );
});

SheetContent.displayName = 'BottomSheetView';