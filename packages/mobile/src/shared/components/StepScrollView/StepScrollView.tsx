import { StepComponentProps } from '../StepView/StepView.interface';
import React, { FC, memo, useEffect, useRef } from 'react';
import { ScrollViewProps } from 'react-native';
import { ScrollView as RNGHScrollView } from 'react-native-gesture-handler';
import Animated, { AnimateProps } from 'react-native-reanimated';

const AnimatedScrollView = Animated.createAnimatedComponent(RNGHScrollView);

interface Props extends AnimateProps<ScrollViewProps>, StepComponentProps {}

const StepScrollViewComponent: FC<Props> = ({ active, ...scrollViewProps }) => {
  const scrollViewRef = useRef<RNGHScrollView>(null);

  useEffect(() => {
    if (!active) {
      const timeoutId = setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0 });
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [active]);

  return (
    <AnimatedScrollView
      ref={scrollViewRef}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      bounces={false}
      {...scrollViewProps}
    />
  );
};

export const StepScrollView = memo(StepScrollViewComponent);
