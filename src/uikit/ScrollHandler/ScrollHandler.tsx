import React, { FC, useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  LargeNavBar,
  LargeNavBarInteractiveDistance,
} from '$uikit/LargeNavBar/LargeNavBar';
import {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';

import { ScrollPositionContext } from './ScrollPositionContext';
import { ScrollHandlerProps } from '$uikit/ScrollHandler/ScrollHandler.interface';
import { NavBar } from '$uikit';
import { Dimensions } from 'react-native';
import { TabletMaxWidth } from '$shared/constants';

const { width: deviceWidth } = Dimensions.get('window');

export const ScrollHandler: FC<ScrollHandlerProps> = (props) => {
  const {
    children,
    navBarTitle,
    navBarRight,
    bottomComponent,
    onPress,
    isLargeNavBar = true,
    hideBackButton,
    hitSlop,
  } = props;

  const scrollRef = useRef<any>(null);
  const scrollTop = useSharedValue(0);
  const [isEnd, setEnd] = useState(true);
  const { changeEnd } = useContext(ScrollPositionContext);

  const isBigScreen = deviceWidth > TabletMaxWidth;
  const shouldRenderLargeNavBar = !isBigScreen && isLargeNavBar;

  useScrollToTop(scrollRef);

  useFocusEffect(
    React.useCallback(() => {
      changeEnd(isEnd);
    }, [changeEnd, isEnd]),
  );

  const changeScrollOnJS = useCallback(
    (newPosition: number, contentHeight: number, containerHeight: number) => {
      const newEnd = newPosition + containerHeight >= contentHeight;
      changeEnd(newEnd);
      setEnd(newEnd);
    },
    [changeEnd],
  );

  const correctScrollHandler = useCallback(
    (top: number) => {
      if (top < LargeNavBarInteractiveDistance / 2) {
        scrollRef.current?.getScrollResponder()?.scrollTo({
          y: 0,
          animated: true,
        });
      } else {
        scrollRef.current?.getScrollResponder()?.scrollTo({
          y: LargeNavBarInteractiveDistance,
          animated: true,
        });
      }
    },
    [scrollRef],
  );

  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        scrollTop.value = event.contentOffset.y;

        runOnJS(changeScrollOnJS)(
          event.contentOffset.y,
          event.contentSize.height,
          event.layoutMeasurement.height,
        );
      },
      onEndDrag(event) {
        const top = event.contentOffset.y;
        if (
          top > 0 &&
          top < LargeNavBarInteractiveDistance &&
          (!event.velocity || !event.velocity.y)
        ) {
          runOnJS(correctScrollHandler)(top);
        }
      },
      onMomentumEnd(event) {
        const top = event.contentOffset.y;
        if (
          top > 0 &&
          top < LargeNavBarInteractiveDistance &&
          event.velocity &&
          event.velocity.y !== 0
        ) {
          runOnJS(correctScrollHandler)(top);
        }
      },
    },
    [scrollRef],
  );

  return useMemo(() => {
    return (
      <>
        {!!navBarTitle && shouldRenderLargeNavBar && (
          <LargeNavBar
            onPress={onPress}
            bottomComponent={bottomComponent}
            scrollTop={scrollTop}
            rightContent={navBarRight}
            hitSlop={hitSlop}
          >
            {navBarTitle}
          </LargeNavBar>
        )}
        {!!navBarTitle && !shouldRenderLargeNavBar && (
          <NavBar
            hideBackButton={hideBackButton || (isLargeNavBar && isBigScreen)}
            scrollTop={scrollTop}
            rightContent={navBarRight}
          >
            {navBarTitle}
          </NavBar>
        )}
        {React.cloneElement(children, {
          onScroll: scrollHandler,
          ref: scrollRef,
        })}
      </>
    );
  }, [scrollTop, hideBackButton, navBarTitle, children, scrollHandler]);
};
