import DraggableFlashList from '../DraggableFlashList';
import React, { forwardRef, memo, useMemo } from 'react';
import { useScreenScroll } from '$uikit/Screen/context/ScreenScrollContext';
import { useBottomTabBarHeight } from '$hooks/useBottomTabBarHeight';
import { useMergeRefs } from '$utils';
import { useScrollHandler } from '$uikit/ScrollHandler/useScrollHandler';
import { ContentStyle } from '@shopify/flash-list';

export const ScreenDraggableFlashList = memo<any>(
  forwardRef((props, ref) => {
    const { contentContainerStyle, ...other } = props;
    const { detectContentSize, detectLayoutSize, scrollHandler, scrollRef } =
      useScreenScroll();
    const tabBarHeight = useBottomTabBarHeight();
    const setRef = useMergeRefs(ref, scrollRef);

    useScrollHandler(undefined, true); // TODO: remove this, when old separator will be removed

    const contentStyle: ContentStyle = useMemo(
      () => ({
        paddingBottom: tabBarHeight,
        ...contentContainerStyle,
      }),
      [contentContainerStyle, tabBarHeight],
    );

    return (
      <DraggableFlashList
        onContentSizeChange={detectContentSize}
        contentContainerStyle={contentStyle}
        onLayout={detectLayoutSize}
        onScroll={scrollHandler}
        ref={setRef}
        {...other}
      />
    );
  }),
);
