import { PageViewExternalPage, PageViewExternalPageProps } from './PageViewExternalPage';
import { PagerViewContext, usePagerViewHandler } from './hooks/usePagerView';
import { ScreenBottomSeparator } from '../Screen/ScreenBottomSeparator';
import { PagerViewInternalHeader } from './PagerViewInternalHeader';
import { PageViewExternalHeader } from './PageViewExternalHeader';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { PageIndexContext } from './hooks/usePageIndex';
import { PagerViewTabBar } from './PagerViewTabBar';
import React, { forwardRef, memo, useCallback, useMemo } from 'react';

import PagerView, { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import Animated from 'react-native-reanimated';
import { useMergeRefs } from '../../utils';
import { useScreenScroll } from '../Screen/hooks';

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

type Elements = {
  header: React.ReactNode;
  pages: React.ReactNode[];
  tabs: { label: string }[];
};

export type PagerViewRef = PagerView;
export type PagerViewSelectedEvent = PagerViewOnPageSelectedEvent;

interface PagerViewContainerProps {
  hideBottomSeparator?: boolean;
  children?: React.ReactNode;
  tabBarStyle?: ViewStyle;
  hideFunny?: boolean;
  ref?: React.Ref<PagerViewRef>;
  initialPage?: number;
  scrollEnabled?: boolean;
  disableRightScroll?: boolean;
  onPageSelected?: (e: PagerViewOnPageSelectedEvent) => void;
  pageOffset?: Animated.SharedValue<number>;
  overdrag?: boolean;
}

export const PagerViewContainer = memo<PagerViewContainerProps>(
  forwardRef((props, ref) => {
    const { hideBottomSeparator, pageOffset, overdrag = true, disableRightScroll, onPageSelected } = props;
    const pager = usePagerViewHandler(pageOffset);
    const setRef = useMergeRefs(ref, pager.pagerViewRef);
    const { scrollY } = useScreenScroll();

    const handlePageSelected = useCallback((ev: PagerViewSelectedEvent) => {
      if (onPageSelected) {
        onPageSelected(ev);
      }

      scrollY.value = 0;
    }, [onPageSelected]);

    const elements = useMemo(() => {
      const accumulator: Elements = { header: null, pages: [], tabs: [] };
      return React.Children.toArray(props.children).reduce((acc, child) => {
        if (React.isValidElement(child)) {
          if (child.type === PageViewExternalHeader) {
            acc.header = child.props.children;
          }
          
          if (child.type === PageViewExternalPage) {
            const props: PageViewExternalPageProps = child.props;
            acc.pages.push(props.children);

            if (props.tabLabel) {
              acc.tabs.push({ label: props.tabLabel });
            }
          }
        }

        return acc;
      }, accumulator);
    }, [props.children]);

    return (
      <PagerViewContext.Provider value={pager}>
        <View style={styles.pagerView}>
          <PagerViewInternalHeader>
            {elements.header}
            {elements.tabs.length ? (
              <PagerViewTabBar style={props.tabBarStyle} tabs={elements.tabs} />
            ) : null}
          </PagerViewInternalHeader>
          <AnimatedPagerView
            onPageScroll={pager.horizontalScrollHandler}
            scrollEnabled={props.scrollEnabled ?? true}
            disableRightScroll={disableRightScroll}
            initialPage={props.initialPage ?? 0}
            onPageSelected={handlePageSelected}
            style={styles.pagerView}
            overdrag={overdrag}
            ref={setRef}
          >
            {elements.pages.map((children, index) => (
              <View key={`pager-view-page-${index}`}>
                <PageIndexContext.Provider value={index}>
                  {children}
                </PageIndexContext.Provider>
              </View>
            ))}
          </AnimatedPagerView>
          {!hideBottomSeparator && <ScreenBottomSeparator />}
        </View>
      </PagerViewContext.Provider>
    );
  }),
);

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
});
