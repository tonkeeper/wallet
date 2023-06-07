import { PageViewExternalPage, PageViewExternalPageProps } from './PageViewExternalPage';
import { PagerViewContext, usePagerViewHandler } from './hooks/usePagerView';
import { ScreenBottomSeparator } from '../Screen/ScreenBottomSeparator';
import { PagerViewInternalHeader } from './PagerViewInternalHeader';
import { PageViewExternalHeader } from './PageViewExternalHeader';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { PageIndexContext } from './hooks/usePageIndex';
import { PagerViewTabBar } from './PagerViewTabBar';
import { PageViewFunny } from './PageViewFunny';
import React, { memo, useMemo } from 'react';

import PagerView from 'react-native-pager-view';
import Animated from 'react-native-reanimated';

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

type Elements = {
  header: React.ReactNode;
  pages: React.ReactNode[];
  tabs: { label: string }[];
};

interface PagerViewContainerProps {
  hideBottomSeparator?: boolean;
  children?: React.ReactNode;
  tabBarStyle?: ViewStyle;
  hideFunny?: boolean;
}

export const PagerViewContainer = memo<PagerViewContainerProps>((props) => {
  const { hideBottomSeparator } = props;
  const pager = usePagerViewHandler();

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
          <PagerViewTabBar style={props.tabBarStyle} tabs={elements.tabs} />
        </PagerViewInternalHeader>
        {/* {!props.hideFunny && <PageViewFunny />} */}
        <AnimatedPagerView
          onPageScroll={pager.horizontalScrollHandler}
          ref={pager.pagerViewRef}
          style={styles.pagerView}
          initialPage={0}
          scrollEnabled
          overdrag
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
});

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
});
