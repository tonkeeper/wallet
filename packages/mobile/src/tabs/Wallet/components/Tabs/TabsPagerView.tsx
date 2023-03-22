import React, { useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import PagerView from 'react-native-pager-view';
import Animated, { Extrapolate, interpolate, runOnJS, useAnimatedReaction, useAnimatedStyle, useEvent, useHandler, withSpring } from 'react-native-reanimated';
import { useTabCtx } from './TabsContainer';
import funy from '$assets/funy.json';
import { Haptics } from '$utils';

interface TabsPagerViewProps {

}

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView)

function usePageScrollHandler(handlers: any, dependencies?: any) {
  const {context, doDependenciesDiffer} = useHandler(handlers, dependencies);
  const subscribeForEvents = ['onPageScroll'];

  return useEvent(
    event => {
      'worklet';
      const {onPageScroll} = handlers;
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

  React.useEffect(() => {
    const setPage = (index: number) => {
      requestAnimationFrame(() => refPagerView.current?.setPage(index));
    }

    setPageFN(setPage);
  }, []);

  const pageScrollHandler = usePageScrollHandler({
    onPageScroll: e => {
      'worklet';
      
      pageOffset.value = e.offset + e.position;
    },
  });

  useAnimatedReaction(() => pageOffset.value, () => {
    if (pageOffset.value > 1.8) {
      runOnJS(Haptics.notificationSuccess)();
    }
  })

  const funyStyle = useAnimatedStyle(() => {
    const scale = withSpring(pageOffset.value > 1.89 && pageOffset.value < 1.892 ? 2 : 1);

    return {
      transform: [{ 
        translateX: interpolate(
          pageOffset.value,
          [1.8, 1.9],
          [110, -5],
          Extrapolate.CLAMP
        )
      }, {
        scale: scale,
      }]
    }
  });

  return (
    <View style={styles.pagerView}>
      <Animated.View style={[styles.funy, funyStyle]}>
        <FastImage 
          source={{ uri: funy.image }}
          style={{ width: 200, height: 200 }}
        />
      </Animated.View>
      <AnimatedPagerView 
        onPageScroll={pageScrollHandler}
        ref={refPagerView}
        style={styles.pagerView} 
        onPageSelected={(ev) => {
          setNativeActiveIndex(ev.nativeEvent.position);
        }}
        initialPage={0}
        scrollEnabled={true}
        // overScrollMode="always"
        overdrag
      >
        {props.children}
      </AnimatedPagerView>      
    </View>
  );
};

const screenHeight = Dimensions.get('window').height

const styles = StyleSheet.create({
  pagerView: {
    flex: 1
  },
  funy: {
    position: 'absolute',
    right: -80,
    top: (screenHeight / 3)
  }
});