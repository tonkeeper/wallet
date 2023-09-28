import React from 'react';
import Animated from 'react-native-reanimated';
import { SCROLLABLE_TYPE, useBottomSheetInternal } from '@gorhom/bottom-sheet';
import { BottomSheetViewProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetView/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSheetInternal } from '@tonkeeper/router';
import { Alert } from 'react-native';

export type SheetModalContentProps = BottomSheetViewProps & {
  disabledInertia?: boolean;
  safeArea?: boolean;
};

export const SheetModalContent = React.memo<SheetModalContentProps>((props) => {
  const {
    enableFooterMarginAdjustment = false,
    disabledInertia,
    style,
    children,
    safeArea,
    ...rest
  } = props;

  const { animatedScrollableContentOffsetY, animatedScrollableType } =
    useBottomSheetInternal();

  const safeAreaInsets = useSafeAreaInsets();
  const { measureContent } = useSheetInternal();

  React.useEffect(() => {
    if (disabledInertia) {
      //
    }

    animatedScrollableContentOffsetY.value = 0;
    animatedScrollableType.value = SCROLLABLE_TYPE.VIEW;
  }, []);

  const bottomInset = safeAreaInsets.bottom;
  const safeAreaStyle = { paddingBottom: bottomInset };

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

SheetModalContent.displayName = 'BottomSheetView';
