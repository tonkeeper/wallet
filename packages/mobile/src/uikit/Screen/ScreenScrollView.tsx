import { useBottomTabBarHeight } from '$hooks/useBottomTabBarHeight';
import { useScrollToTop } from '@react-navigation/native';
import { forwardRef, memo, useRef } from 'react';
import Animated from 'react-native-reanimated';
import { ScrollViewProps } from 'react-native';
import { useScreenScroll } from './hooks';
import { ns, useMergeRefs } from '$utils';

interface ScreenScrollView extends ScrollViewProps {
  indent?: boolean;
}

export const ScreenScrollView = memo(forwardRef<Animated.ScrollView, ScreenScrollView>((props, ref) => {
  const { indent = true } = props;
  const scrollRef = useRef<Animated.ScrollView>(null);
  const tabBarHeight = useBottomTabBarHeight();
  const { scrollHandler } = useScreenScroll();
  const setRef = useMergeRefs(scrollRef, ref);

  useScrollToTop(scrollRef);
  
  const contentContainerStyle = [
    {
      ...(indent && { paddingHorizontal: ns(16) }),
      paddingBottom: tabBarHeight,
      // paddingTop: ns(NavBarHeight),
    }, 
    props.contentContainerStyle
  ];

  return (
    <Animated.ScrollView
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={scrollHandler}
      ref={setRef}
      {...props}
    >
      {props.children}
    </Animated.ScrollView>
  );
}));
