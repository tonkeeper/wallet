import { useDimensions } from '$hooks/useDimensions';
import React, {
  Children,
  FC,
  forwardRef,
  memo,
  ReactElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { BackHandler, LayoutChangeEvent, LayoutRectangle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { StepViewItemProps, StepViewProps } from './StepView.interface';
import * as S from './StepView.style';
import { deviceHeight } from '$utils';

export interface StepViewRef<T = string | number> {
  goNext: () => void;
  goBack: () => void;
  go: (nextStepId: T) => void;
  currentStepId: T;
  currentStepIndex: number;
}

export const StepViewItem: FC<StepViewItemProps> = () => null;

const StepViewComponent = forwardRef<StepViewRef, StepViewProps>((props, ref) => {
  const {
    children,
    backDisabled,
    initialStepId,
    useBackHandler,
    autoHeight = false,
    swipeEnabled = false,
    swipeBackEnabled = false,
    onChangeStep,
  } = props;

  const {
    window: { width },
  } = useDimensions();

  const [layouts, setLayouts] = useState<{
    [key: StepViewItemProps['id']]: LayoutRectangle;
  }>({});

  const steps = useMemo(() => {
    const childrenArray: (ReactElement<StepViewItemProps> | null)[] = Array.isArray(
      children,
    )
      ? children
      : [children];

    const stepItems = childrenArray.filter(Boolean) as ReactElement<StepViewItemProps>[];

    if (stepItems.length > 0) {
      return Children.map(stepItems, (child) => {
        const itemProps = child.props;
        return itemProps;
      });
    }

    return [];
  }, [children]);

  const [currentStepId, setCurrentStepId] = useState(() => {
    if (initialStepId && steps.findIndex((item) => item.id === initialStepId) !== -1) {
      return initialStepId;
    }

    return steps[0].id;
  });

  const currentIndex = steps.findIndex((step) => step.id === currentStepId);

  // const position = useDerivedValue(
  //   () => currentIndex * width * -1,
  //   [currentIndex, width],
  // );

  const position = useSharedValue(currentIndex * width * -1);

  const containerStyle = useAnimatedStyle(() => {
    const maxHeight = layouts[currentStepId]?.height || 0;

    return {
      transform: [
        {
          translateX: withSpring(position.value, {
            damping: 15,
            mass: 0.1,
          }),
        },
      ],
      maxHeight: autoHeight && maxHeight > 0 ? maxHeight : 'auto',
      flex: autoHeight ? undefined : 1,
    };
  }, [layouts, currentStepId]);

  const handleStepLayout = useCallback(
    (step: StepViewItemProps, event: LayoutChangeEvent) => {
      const layout = event?.nativeEvent?.layout;

      if (layout) {
        setLayouts((s) => ({ ...s, [step.id]: layout }));
      }
    },
    [],
  );

  const setStepIdByIndex = useCallback(
    (nextIndex: number, velocity?: number) => {
      const nextStepId = steps[nextIndex].id;

      setCurrentStepId(nextStepId);

      position.value = withSpring(nextIndex * width * -1, {
        velocity,
        damping: 15,
        mass: velocity ? 0.07 : 0.25,
      });
    },
    [position, steps, width],
  );

  const goNext = useCallback(() => {
    const nextIndex = Math.min(currentIndex + 1, steps.length - 1);

    setStepIdByIndex(nextIndex);
  }, [currentIndex, setStepIdByIndex, steps.length]);

  const goBack = useCallback(() => {
    if (backDisabled || currentIndex === 0) {
      return false;
    }

    const prevIndex = Math.max(currentIndex - 1, 0);

    setStepIdByIndex(prevIndex);

    return true;
  }, [backDisabled, currentIndex, setStepIdByIndex]);

  const go = useCallback(
    (nextStepId: string | number) => {
      const index = Math.max(
        steps.findIndex((step) => step.id === nextStepId),
        0,
      );

      setStepIdByIndex(index);
    },
    [setStepIdByIndex, steps],
  );

  const startPosition = useSharedValue(position.value);

  const stepsLastIndex = steps.length - 1;

  const gesture = Gesture.Pan()
    .failOffsetY(90)
    .failOffsetY(-90)
    .minDistance(50)
    .enabled(swipeEnabled || swipeBackEnabled)
    .onBegin(() => {
      startPosition.value = position.value;
    })
    .onUpdate((e) => {
      let diff = e.translationX;

      if (swipeBackEnabled && diff < 0) {
        return;
      }

      if (
        (currentIndex === stepsLastIndex && diff < 0) ||
        (currentIndex === 0 && diff > 0)
      ) {
        diff = 2 + 0.456 * diff - 0.000124 * diff ** 2;
      }

      position.value = startPosition.value + diff;
    })
    .onEnd((e) => {
      if (swipeBackEnabled && e.translationX < 0) {
        return;
      }

      const velocity = Math.abs(e.velocityX) > 200 ? e.velocityX : 0;
      const pos = Math.abs(e.translationX) > 200 ? e.translationX : 0;

      let direction = 0;

      if ((velocity < 0 || pos < 0) && currentIndex !== stepsLastIndex) {
        direction = 1;
      }

      if ((velocity > 0 || pos > 0) && currentIndex > 0) {
        direction = -1;
      }

      runOnJS(setStepIdByIndex)(currentIndex + direction, velocity);
    })
    .onFinalize(() => {});

  useEffect(() => {
    onChangeStep?.(currentStepId, currentIndex);
  }, [currentIndex, currentStepId, onChangeStep]);

  useEffect(() => {
    if (!useBackHandler) {
      return;
    }

    BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', goBack);
    };
  }, [goBack, useBackHandler]);

  useImperativeHandle(
    ref,
    () => ({
      goNext,
      goBack,
      go,
      currentStepId,
      currentStepIndex: currentIndex,
    }),
    [currentIndex, currentStepId, go, goBack, goNext],
  );

  return (
    <GestureDetector gesture={gesture}>
      <S.Container style={containerStyle}>
        {steps.map((step) => (
          <S.Step
            hitSlop={{ bottom: deviceHeight }}
            key={step.id}
            width={width}
            autoHeight={autoHeight}
            onLayout={autoHeight ? (event) => handleStepLayout(step, event) : undefined}
          >
            {typeof step.children === 'function'
              ? step.children({ active: step.id === currentStepId })
              : step.children}
          </S.Step>
        ))}
      </S.Container>
    </GestureDetector>
  );
});

export const StepView = memo(StepViewComponent);
