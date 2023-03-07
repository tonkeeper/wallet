import React, { createContext, memo } from 'react';
import { StyleSheet, View } from 'react-native';
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
  scrollY: SharedValue<number>;
  contentOffset: SharedValue<number>;
  headerHeight: SharedValue<number>;
  headerOffsetStyle: { height: number };
} | null>(null);

export const TabsContainer = memo<TabsContainerProps>((props) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const contentOffset = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const headerHeight = useSharedValue(0);
  
  
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

  return (
    <TabsContext.Provider value={{ 
      activeIndex, 
      setActiveIndex,
      setScrollTo,
      scrollAllTo,
      scrollToIndex,
      scrollY,
      contentOffset,
      headerHeight,
      headerOffsetStyle
    }}>
      <View style={styles.container}>
        {props.children}
      </View>
    </TabsContext.Provider>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  }
});

export const useTabCtx = () => {
  const ctx = React.useContext(TabsContext);

  if (!ctx) {
    throw new Error('!ctx')
  }

  return ctx;
}