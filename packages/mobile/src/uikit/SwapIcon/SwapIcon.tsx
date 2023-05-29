import React, { memo, useCallback, useEffect } from 'react';
import {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as S from './SwapIcon.style';
import { getSwapShownCount, setSwapShownCount } from '$database';

interface Props {
  animated?: boolean;
}

export const SwapIcon = memo((props: Props) => {
  const iconAnimation = useSharedValue(0.5);

  const iconTranslateY = useDerivedValue(() =>
    interpolate(iconAnimation.value, [0, 0.5, 1], [-30, 0, 30]),
  );

  const leftArrowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: iconTranslateY.value,
      },
    ],
  }));

  const rightArrowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: iconTranslateY.value * -1,
      },
      {
        rotate: '180deg',
      },
    ],
  }));

  const animate = useCallback(async () => {
    try {
      const shownCount = await getSwapShownCount();

      if (shownCount > 1) {
        return;
      }

      iconAnimation.value = withDelay(
        2000,
        withSequence(
          withTiming(1, { duration: 150 }),
          withTiming(0, { duration: 0 }),
          withSpring(
            0.5,
            {
              damping: 15,
              mass: 0.2,
            },
            (finished) => {
              if (finished) {
                runOnJS(setSwapShownCount)(shownCount + 1);
              }
            },
          ),
        ),
      );
    } catch {}
  }, [iconAnimation]);

  useEffect(() => {
    if (props.animated) {
      animate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <S.LeftArrow style={leftArrowStyle} />
      <S.LeftArrow style={rightArrowStyle} />
    </>
  );
});
