import React, { createContext, memo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { SharedValue, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

interface TabsContainerProps {
  children?: React.ReactNode;
}

type ScrollTo = (y: number, animated?: boolean) => void;

export const TabsContext = createContext<{
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  setScrollTo: (index: number, scrollTo: ScrollTo) => void;
  scrollAllTo: (index: number, a: number) => void;
  scrollToIndex: (index: number) => void;
  setPageFN: (fn: (index: number) => void) => void;
  setNativeActiveIndex: (index: number) => void;
  scrollY: SharedValue<number>;
  contentOffset: SharedValue<number>;
  headerHeight: SharedValue<number>;
  pageOffset: SharedValue<number>;
  localActive: number;
  headerOffsetStyle: { height: number };
} | null>(null);

export const TabsContainer = memo<TabsContainerProps>((props) => {
  const [activeIndex, setStateActiveIndex] = React.useState(0);
  const [localActive, setActiveLocal] = React.useState(0);
  const setActiveIndexFN = useRef<((index: number) => void) | null>(null);

  const contentOffset = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const headerHeight = useSharedValue(0);
  const pageOffset = useSharedValue(0);
  
  
  const refs = React.useRef<{ [key in string]: ScrollTo }>({});
  const setScrollTo = (index: number, scrollTo: ScrollTo) => {
    refs.current[`scroll-${index}`] = scrollTo;
  };    

  const scrollToIndex = (index: number) => {
    const scrollTo = refs.current[`scroll-${index}`];
    if (scrollTo) {
      scrollTo(scrollY.value);
    }
  }

  const scrollAllTo = (currentIndex: number, y: number) => {
    Object.values(refs.current).forEach((scrollTo, index) => {
      if (index !== currentIndex) {
        scrollTo(y, false);
      }
    });
  }

  const headerOffsetStyle = useAnimatedStyle(() => ({ 
    height: headerHeight.value 
  }));

  const setPageFN = (fn) => {
    setActiveIndexFN.current = fn;
  }

  const setActiveIndex = (index: number) => {
    setActiveIndexFN.current?.(index);
    setActiveLocal(index);
  } 

  const setNativeActiveIndex = (index: number) => {
    setStateActiveIndex(index);
    setActiveLocal(index);
  }


  return (
      <View style={styles.pagerView}>
        <TabsContext.Provider value={{ 
          activeIndex, 
          setActiveIndex,
          setPageFN,
          setScrollTo,
          scrollAllTo,
          scrollToIndex,
          setNativeActiveIndex,
          localActive,
          scrollY,
          contentOffset,
          headerHeight,
          headerOffsetStyle,
          pageOffset
        }}>
          {props.children}
        </TabsContext.Provider>
      </View>

  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  pagerView: {
    flex: 1,
  }
});

export const useTabCtx = () => {
  const ctx = React.useContext(TabsContext);

  if (!ctx) {
    throw new Error('!ctx')
  }

  return ctx;
}