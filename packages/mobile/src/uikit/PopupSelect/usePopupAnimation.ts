import React from 'react';
import {
  cancelAnimation,
  interpolate,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const OPACITY_DURATION = 150;
export const SCALE_DURATION = 200;
const SPRING_CONFIG = {
  damping: 39,
  mass: 1.09,
  stiffness: 500,
  restDisplacementThreshold: 0.001,
  restSpeedThreshold: 0.001,
  reduceMotion: ReduceMotion.Never,
};

export type AnchorPosition = 'top-right' | 'top-left' | 'top-center';

export const popupAnimationAnchor = (
  anchor: AnchorPosition,
  width: number,
  height: number,
) => {
  'worklet';

  const splitedAnchor = anchor.split('-');
  const isRight = splitedAnchor[1] === 'right';

  const startY = (height / 2) * -1;
  const endY = (height / 2) * 1;

  const startX = (width / 2) * -1;
  const endX = (width / 2) * 1;

  return {
    startTransform: {
      translateX: isRight ? -startX : startX,
      translateY: startY,
    },
    endTransform: {
      translateX: isRight ? -endX : endX,
      translateY: endY,
    },
  };
};

type UsePopupAnimationOptions = {
  anchor: AnchorPosition;
  width: number;
  height: number;
};

export enum PopupAnimationState {
  OPENING = 'OPENING',
  OPENED = 'OPENED',
  CLOSING = 'CLOSING',
  CLOSED = 'CLOSED',
}

export const usePopupAnimation = (options: UsePopupAnimationOptions) => {
  const { anchor, width, height } = options;
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const state = useSharedValue<PopupAnimationState>(PopupAnimationState.CLOSED);

  const open = React.useCallback((onDone?: () => void) => {
    if (state.value !== PopupAnimationState.OPENED) {
      cancelAnimation(scale);
      cancelAnimation(opacity);

      state.value = PopupAnimationState.OPENING;
      scale.value = withSpring(1, SPRING_CONFIG, (isFinising) => {
        if (isFinising) {
          state.value = PopupAnimationState.OPENED;
          if (onDone) {
            runOnJS(onDone)();
          }
        }
      });

      opacity.value = withTiming(1, {
        duration: OPACITY_DURATION,
        reduceMotion: ReduceMotion.Never,
      });
    }
  }, []);

  const close = React.useCallback((onDone?: () => void) => {
    if (state.value !== PopupAnimationState.CLOSED) {
      cancelAnimation(scale);
      cancelAnimation(opacity);

      state.value = PopupAnimationState.CLOSING;
      scale.value = withTiming(
        0,
        { duration: SCALE_DURATION, reduceMotion: ReduceMotion.Never },
        (isFinished) => {
          if (isFinished && onDone) {
            state.value = PopupAnimationState.CLOSED;
            runOnJS(onDone)();
          }
        },
      );

      opacity.value = withTiming(0, {
        duration: OPACITY_DURATION,
        reduceMotion: ReduceMotion.Never,
      });
    }
  }, []);

  const style = useAnimatedStyle(() => {
    const animatedHeight = interpolate(opacity.value, [0, 1], [0, height]);

    const translate = popupAnimationAnchor(anchor, width, animatedHeight);

    return {
      height: animatedHeight,
      opacity: opacity.value,
      transform: [
        { translateX: translate.startTransform.translateX },
        { translateY: translate.startTransform.translateY },
        { scale: scale.value },
        { translateX: translate.endTransform.translateX },
        { translateY: translate.endTransform.translateY },
      ],
    };
  }, [width, height]);

  return { close, open, style, state: state.value };
};
