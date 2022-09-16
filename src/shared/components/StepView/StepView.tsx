import { useDimensions } from '$hooks';
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
import { BackHandler } from 'react-native';
import { useAnimatedStyle, useDerivedValue, withSpring } from 'react-native-reanimated';
import { StepViewItemProps, StepViewProps } from './StepView.interface';
import * as S from './StepView.style';

export interface StepViewRef<T = string | number> {
  goNext: () => void;
  goBack: () => void;
  go: (nextStepId: T) => void;
  currentStepId: T;
  currentStepIndex: number;
}

export const StepViewItem: FC<StepViewItemProps> = () => null;

const StepViewComponent = forwardRef<StepViewRef, StepViewProps>((props, ref) => {
  const { children, backDisabled, initialStepId, useBackHandler, onChangeStep } = props;

  const {
    window: { width },
  } = useDimensions();

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

  const position = useDerivedValue(
    () => currentIndex * width * -1,
    [currentIndex, width],
  );

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(position.value, {
          damping: 15,
          mass: 0.5,
        }),
      },
    ],
  }));

  const goNext = useCallback(() => {
    const nextIndex = Math.min(currentIndex + 1, steps.length - 1);

    const nextStepId = steps[nextIndex].id;

    setCurrentStepId(nextStepId);
  }, [currentIndex, steps]);

  const goBack = useCallback(() => {
    if (backDisabled || currentIndex === 0) {
      return false;
    }

    const prevIndex = Math.max(currentIndex - 1, 0);

    const prevStepId = steps[prevIndex].id;

    setCurrentStepId(prevStepId);

    return true;
  }, [backDisabled, currentIndex, steps]);

  const go = useCallback((nextStepId: string | number) => {
    setCurrentStepId(nextStepId);
  }, []);

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
    <S.Container style={containerStyle}>
      {steps.map((step) => (
        <S.Step key={step.id} width={width}>
          {typeof step.children === 'function'
            ? step.children({ active: step.id === currentStepId })
            : step.children}
        </S.Step>
      ))}
    </S.Container>
  );
});

export const StepView = memo(StepViewComponent);
