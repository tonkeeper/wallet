import React from 'react';
import DefaultBottomSheet, { BottomSheetModal, BottomSheetBackdropProps, BottomSheetProps as DefaultBottomSheetProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isAndroid, statusBarHeight, useMergeRefs } from '$utils';
import { useSheetInternal } from './SheetsProvider';
import SheetBackdrop from './SheetBackdrop';
import { useTheme } from '$hooks';

export type SheetModalRef = BottomSheetModal;

export type SheetModalProps = Omit<DefaultBottomSheetProps, 'snapPoints'> & {
  children: React.ReactNode;
};

export const SheetModal = React.memo(React.forwardRef<SheetModalProps, SheetModalRef>((props, ref) => {
  const bottomSheetRef = React.useRef<DefaultBottomSheet>(null);
  const setRef = useMergeRefs(ref, bottomSheetRef);
  const safeArea = useSafeAreaInsets();
  const theme = useTheme();

  const { 
    delegateMethods,
    removeFromStack,
    contentHeight,
    handleHeight,
    initialState,
    snapPoints,
  } = useSheetInternal();

  const index = React.useMemo(() => {
    return initialState === 'closed' ? -1 : 0; 
  }, [])

  React.useEffect(() => {
    delegateMethods({
      present: () => bottomSheetRef.current?.snapToIndex(0),
      close: () => bottomSheetRef.current?.close(),
    });
  }, []);

  const topInset = !isAndroid 
    ? statusBarHeight + safeArea.top 
    : 0;

  return (
    <DefaultBottomSheet
      backdropComponent={BackdropSheetComponent}
      contentHeight={contentHeight}
      handleHeight={handleHeight}
      enablePanDownToClose={true}
      onClose={removeFromStack}
      snapPoints={snapPoints}
      handleComponent={null}
      topInset={topInset}
      index={index}
      ref={setRef}
      backgroundStyle={{ 
        borderRadius:theme.radius.large, 
        backgroundColor: theme.colors.backgroundPrimary 
      }}
      {...props}
    >
      {props.children}
    </DefaultBottomSheet>
  );
}));

const BackdropSheetComponent = React.memo((props: BottomSheetBackdropProps) => (
  <SheetBackdrop
    {...props}
    key="backdrop"
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={0.72}
  />
));