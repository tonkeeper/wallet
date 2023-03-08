import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import Animated, { useEvent, useHandler } from 'react-native-reanimated';
import { useTabCtx } from './TabsContainer';

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

  return (
    <View style={styles.pagerView}>
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

const styles = StyleSheet.create({
  pagerView: {
    flex: 1
  }
});