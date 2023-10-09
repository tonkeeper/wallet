import { forwardRef, memo, useCallback, useEffect, useMemo, useRef } from 'react';
import DefaultBottomSheet, {
  BottomSheetModal,
  BottomSheetBackdropProps,
  BottomSheetProps as DefaultBottomSheetProps,
  useBottomSheetSpringConfigs,
  useBottomSheetTimingConfigs,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isAndroid, isIOS, StatusBarHeight, useMergeRefs } from '../../../utils';
import { SheetModalBackdrop } from './SheetModalBackdrop';
import { useTheme } from '../../../styles';

import { useSheetInternal } from '@tonkeeper/router';
import { Easing, ReduceMotion, useReducedMotion } from 'react-native-reanimated';

export type SheetModalRef = BottomSheetModal;

export type SheetModalProps = Omit<DefaultBottomSheetProps, 'snapPoints'> & {
  children?: React.ReactNode;
};

const ANIMATION_CONFIGS = isIOS
  ? {
      damping: 500,
      stiffness: 1000,
      mass: 3,
      overshootClamping: true,
      restDisplacementThreshold: 10,
      restSpeedThreshold: 10,
      reduceMotion: ReduceMotion.Never,
    }
  : {
      easing: Easing.out(Easing.exp),
      duration: 250,
      reduceMotion: ReduceMotion.Never,
    };

export const SheetModal = memo(
  forwardRef<SheetModalRef, SheetModalProps>((props, ref) => {
    const bottomSheetRef = useRef<DefaultBottomSheet>(null);
    const setRef = useMergeRefs(ref, bottomSheetRef);
    const safeArea = useSafeAreaInsets();
    const theme = useTheme();
    const reduceMotion = useReducedMotion();

    const {
      delegateMethods,
      removeFromStack,
      contentHeight,
      handleHeight,
      initialState,
      snapPoints,
    } = useSheetInternal();

    const index = useMemo(() => {
      return initialState === 'closed' ? -1 : 0;
    }, []);

    useEffect(() => {
      delegateMethods({
        present: () => bottomSheetRef.current?.snapToIndex(0),
        close: () => bottomSheetRef.current?.close(),
      });
    }, []);

    const animationConfigsIOS = useBottomSheetSpringConfigs();

    const animationConfigsAndroid = useBottomSheetTimingConfigs({
      easing: Easing.out(Easing.exp),
      duration: 250,
      reduceMotion: ReduceMotion.Never,
    });

    const topInset = !isAndroid ? StatusBarHeight + safeArea.top : 0;

    const handleClose = useCallback(async () => {
      removeFromStack();
      if (props.onClose) {
        props.onClose();
      }
    }, [props.onClose]);

    return (
      <DefaultBottomSheet
        {...props}
        backdropComponent={BackdropSheetComponent}
        contentHeight={contentHeight}
        handleHeight={handleHeight}
        enablePanDownToClose={true}
        onClose={handleClose}
        // Have to override default animation Configs due to bug with reduced motion
        animationConfigs={ANIMATION_CONFIGS}
        snapPoints={snapPoints}
        handleComponent={null}
        topInset={topInset}
        animateOnMount={!isAndroid || !reduceMotion}
        index={index}
        ref={setRef}
        backgroundStyle={{
          borderRadius: 18,
          backgroundColor: theme.backgroundPage,
        }}
      >
        {props.children}
      </DefaultBottomSheet>
    );
  }),
);

const BackdropSheetComponent = memo((props: BottomSheetBackdropProps) => (
  <SheetModalBackdrop
    {...props}
    key="backdrop"
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={0.72}
  />
));
