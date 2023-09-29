import PagerView, { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import { PropsWithChildren, forwardRef, useCallback } from 'react';
import { usePagerView } from './hooks/usePagerView';
import { useScreenScroll } from '../Screen/hooks';
import Animated from 'react-native-reanimated';
import { useMergeRefs } from '../../utils';
import { StyleSheet } from 'react-native';

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

export type PagerViewRef = PagerView;
export type PagerViewSelectedEvent = PagerViewOnPageSelectedEvent;

export const PagerViewPages = forwardRef<PagerViewRef, PropsWithChildren>(
  (props, ref) => {
    const { children } = props;
    const pager = usePagerView();
    const { scrollY } = useScreenScroll();
    const setRef = useMergeRefs(ref, pager.pagerViewRef);

    const handlePageSelected = useCallback((ev: PagerViewSelectedEvent) => {
      // if (onPageSelected) {
      //   onPageSelected(ev);
      // }

      // scrollY.value = 0;
    }, []);

    return (
      <AnimatedPagerView
        onPageScroll={pager.horizontalScrollHandler}
        // scrollEnabled={props.scrollEnabled ?? true}
        // disableRightScroll={disableRightScroll}
        // initialPage={props.initialPage ?? 0}
        initialPage={0}
        scrollEnabled={true}
        onPageSelected={handlePageSelected}
        style={styles.flex}
        overdrag={true}
        ref={setRef}
      >
        {children}
      </AnimatedPagerView>
    );
  },
);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
