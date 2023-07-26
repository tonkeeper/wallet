import React, { memo, useCallback, useMemo, useRef } from 'react';
import Animated, {
  interpolate,
  Extrapolate,
  useAnimatedStyle,
  useAnimatedReaction,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import {
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

import { useBottomSheet } from '@gorhom/bottom-sheet';
import { Keyboard, StyleSheet, ViewProps } from 'react-native';
import { BottomSheetVariables } from '@gorhom/bottom-sheet/lib/typescript/types';
import { isAndroid } from '../../../utils';

export interface BottomSheetBackdropProps
  extends Pick<ViewProps, 'style'>,
    BottomSheetVariables {}

export type BackdropPressBehavior = 'none' | 'close' | 'collapse' | number;

export interface BottomSheetDefaultBackdropProps extends BottomSheetBackdropProps {
  opacity?: number;
  appearsOnIndex?: number;
  disappearsOnIndex?: number;
  enableTouchThrough?: boolean;
  pressBehavior?: BackdropPressBehavior;
  children?: React.ReactNode;
}

const DEFAULT_OPACITY = 0.5;
const DEFAULT_APPEARS_ON_INDEX = 1;
const DEFAULT_DISAPPEARS_ON_INDEX = 0;
const DEFAULT_ENABLE_TOUCH_THROUGH = false;
const DEFAULT_PRESS_BEHAVIOR = 'close' as const;

const BottomSheetBackdropComponent = ({
  animatedIndex,
  opacity: _providedOpacity,
  appearsOnIndex: _providedAppearsOnIndex,
  disappearsOnIndex: _providedDisappearsOnIndex,
  enableTouchThrough: _providedEnableTouchThrough,
  pressBehavior = DEFAULT_PRESS_BEHAVIOR,
  style,
  children,
}: BottomSheetDefaultBackdropProps) => {
  //#region hooks
  const { snapToIndex, close } = useBottomSheet();
  //#endregion

  //#region defaults
  const opacity = _providedOpacity ?? DEFAULT_OPACITY;
  const appearsOnIndex = _providedAppearsOnIndex ?? DEFAULT_APPEARS_ON_INDEX;
  const disappearsOnIndex = _providedDisappearsOnIndex ?? DEFAULT_DISAPPEARS_ON_INDEX;
  const enableTouchThrough = _providedEnableTouchThrough ?? DEFAULT_ENABLE_TOUCH_THROUGH;
  //#endregion

  //#region variables
  const containerRef = useRef<Animated.View>(null);
  const pointerEvents = enableTouchThrough ? 'none' : 'auto';
  //#endregion

  //#region callbacks
  const handleOnPress = useCallback(() => {
    if (pressBehavior === 'close') {
      if (!isAndroid) {
        Keyboard.dismiss();
      }

      close();
    } else if (pressBehavior === 'collapse') {
      snapToIndex(disappearsOnIndex as number);
    } else if (typeof pressBehavior === 'number') {
      snapToIndex(pressBehavior);
    }
  }, [snapToIndex, close, disappearsOnIndex, pressBehavior]);
  const handleContainerTouchability = useCallback(
    (shouldDisableTouchability: boolean) => {
      if (!containerRef.current) {
        return;
      }
      // @ts-ignore
      containerRef.current.setNativeProps({
        pointerEvents: shouldDisableTouchability ? 'none' : 'auto',
      });
    },
    [],
  );
  //#endregion

  //#region tap gesture
  const gestureHandler = useAnimatedGestureHandler<TapGestureHandlerGestureEvent>(
    {
      onFinish: () => {
        runOnJS(handleOnPress)();
      },
    },
    [handleOnPress],
  );
  //#endregion

  //#region styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [-1, disappearsOnIndex, appearsOnIndex],
      [0, 0, opacity],
      Extrapolate.CLAMP,
    ),
    flex: 1,
  }));
  const containerStyle = useMemo(
    () => [styles.container, style, containerAnimatedStyle],
    [style, containerAnimatedStyle],
  );
  //#endregion

  //#region effects
  useAnimatedReaction(
    () => animatedIndex.value <= disappearsOnIndex,
    (shouldDisableTouchability, previous) => {
      if (shouldDisableTouchability === previous) {
        return;
      }
      runOnJS(handleContainerTouchability)(shouldDisableTouchability);
    },
    [disappearsOnIndex],
  );
  //#endregion

  return pressBehavior !== 'none' ? (
    <TapGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        ref={containerRef}
        style={containerStyle}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Bottom Sheet backdrop"
        accessibilityHint={`Tap to ${
          typeof pressBehavior === 'string' ? pressBehavior : 'move'
        } the Bottom Sheet`}
      >
        {children}
      </Animated.View>
    </TapGestureHandler>
  ) : (
    <Animated.View
      ref={containerRef}
      pointerEvents={pointerEvents}
      style={containerStyle}
    >
      {children}
    </Animated.View>
  );
};

export const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
  },
});

export const SheetModalBackdrop = memo(BottomSheetBackdropComponent);
SheetModalBackdrop.displayName = 'BottomSheetBackdrop';
