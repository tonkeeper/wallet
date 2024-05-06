import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import DefaultBottomSheet, {
  BottomSheetModal,
  BottomSheetBackdropProps,
  BottomSheetProps as DefaultBottomSheetProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isAndroid, isIOS, StatusBarHeight, useMergeRefs } from '../../../utils';
import { SheetModalBackdrop } from './SheetModalBackdrop';
import { useTheme } from '../../../styles';

import { useSheetInternal } from '@tonkeeper/router';
import { Easing, ReduceMotion, useReducedMotion } from 'react-native-reanimated';
import { Handle, InteractionManager } from 'react-native';

export type SheetModalRef = BottomSheetModal;

export type SheetModalProps = Omit<DefaultBottomSheetProps, 'snapPoints'> & {
  children?: React.ReactNode;
  alternateBackground?: boolean;
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
      id,
      contentHeight,
      handleHeight,
      initialState,
      snapPoints,
    } = useSheetInternal();
    const [ignoreOnClose, setIgnoreOnClose] = useState(initialState === 'closed');

    const index = useMemo(() => {
      return initialState === 'closed' ? -1 : 0;
    }, []);

    const interactionHandle = useRef<Handle | null>(null);

    useEffect(() => {
      delegateMethods({
        present: () => bottomSheetRef.current?.snapToIndex(0),
        close: () => {
          interactionHandle.current = InteractionManager.createInteractionHandle();
          bottomSheetRef.current?.close();
        },
      });
    }, []);

    const topInset = !isAndroid ? StatusBarHeight + safeArea.top : safeArea.top;

    const handleIndexChange = useCallback(
      (index: number) => {
        if (ignoreOnClose && index === 0) {
          setIgnoreOnClose(false);
        }
      },
      [ignoreOnClose],
    );

    const handleClose = useCallback(async () => {
      if (interactionHandle.current !== null) {
        InteractionManager.clearInteractionHandle(interactionHandle.current);
        interactionHandle.current = null;
      }
      if (ignoreOnClose) {
        return;
      }
      removeFromStack();
      if (props.onClose) {
        props.onClose();
      }
    }, [props.onClose, ignoreOnClose]);

    return (
      <DefaultBottomSheet
        {...props}
        backdropComponent={BackdropSheetComponent}
        contentHeight={contentHeight}
        handleHeight={handleHeight}
        enablePanDownToClose={true}
        onClose={handleClose}
        onChange={handleIndexChange}
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
          backgroundColor: props.alternateBackground
            ? theme.backgroundPageAlternate
            : theme.backgroundPage,
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
