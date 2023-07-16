import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import PagerView from 'react-native-pager-view';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useEvent,
  useHandler,
  withSpring,
} from 'react-native-reanimated';
import { useTabCtx } from './TabsContainer';
import funny from '$assets/funny.json';
import { Haptics, ns } from '$utils';
import { useBottomTabBarHeight } from '$hooks/useBottomTabBarHeight';

interface TabsPagerViewProps {
  initialPage?: number;
  children: React.ReactNode;
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
  const { setPageFN, pageOffset, setNativeActiveIndex } = useTabCtx();
  const refPagerView = useRef<PagerView>(null);
  const tabBarHeight = useBottomTabBarHeight();
  const numOfTabs = useMemo(() => React.Children.count(props.children), [props.children]);

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

  useAnimatedReaction(
    () => pageOffset.value,
    () => {
      if (pageOffset.value > 1.8 && pageOffset.value < 2) {
        runOnJS(Haptics.notificationSuccess)();
      }
    },
  );

  const funnyStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX:
            pageOffset.value > numOfTabs
              ? 50
              : interpolate(
                  pageOffset.value,
                  [numOfTabs - 0.2, numOfTabs - 0.1],
                  [50, -80],
                  Extrapolate.CLAMP,
                ),
        },
      ],
    };
  });

  return (
    <View style={styles.pagerView}>
      <Animated.View
        style={[styles.funny, funnyStyle, { bottom: ns(16) + tabBarHeight }]}
      >
        <FastImage
          source={{ uri: funny.image }}
          style={{ width: ns(132), height: ns(132) }}
        />
      </Animated.View>
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
