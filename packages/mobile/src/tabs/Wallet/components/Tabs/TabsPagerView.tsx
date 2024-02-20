import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import Animated, { useEvent, useHandler } from 'react-native-reanimated';
import { useTabCtx } from './TabsContainer';
import { useTabPress } from '@tonkeeper/router';

interface TabsPagerViewProps {
  initialPage?: number;
  children: React.ReactNode;
  onActiveIndexChange?: (activeIndex: number) => void;
}

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

function usePageScrollHandler(handlers: any, dependencies?: any) {
  const { context, doDependenciesDiffer } = useHandler(handlers, dependencies);
  const subscribeForEvents = ['onPageScroll'];

  return useEvent(
    (event) => {
      'worklet';
      const { onPageScroll } = handlers;
      if (onPageScroll && event.eventName.endsWith('onPageScroll')) {
        onPageScroll(event, context);
      }
    },
    subscribeForEvents,
    doDependenciesDiffer,
  );
}

export const TabsPagerView: React.FC<TabsPagerViewProps> = (props) => {
  const { setPageFN, pageOffset, setNativeActiveIndex, activeIndex, scrollY } =
    useTabCtx();
  const refPagerView = useRef<PagerView>(null);

  useTabPress(() => {
    if (scrollY.value === 0 && pageOffset.value !== 0) {
      refPagerView.current?.setPage(0);
    }
  });

  useEffect(() => {
    props.onActiveIndexChange?.(activeIndex);
  }, [activeIndex, props]);

  React.useEffect(() => {
    const setPage = (index: number) => {
      requestAnimationFrame(() => refPagerView.current?.setPage(index));
    };

    pageOffset.value = props.initialPage ?? 0;

    setPageFN(setPage);
  }, []);

  const pageScrollHandler = usePageScrollHandler({
    onPageScroll: (e) => {
      'worklet';

      pageOffset.value = e.offset + e.position;
    },
  });

  return (
    <View style={styles.pagerView}>
      <AnimatedPagerView
        onPageScroll={pageScrollHandler}
        ref={refPagerView}
        style={styles.pagerView}
        onPageSelected={(ev) => {
          setNativeActiveIndex(ev.nativeEvent.position);
        }}
        initialPage={props.initialPage ?? 0}
        scrollEnabled={true}
        // overScrollMode="always"
        overdrag
      >
        {props.children}
      </AnimatedPagerView>
    </View>
  );
};

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
  funny: {
    position: 'absolute',
    right: -80,
  },
});
