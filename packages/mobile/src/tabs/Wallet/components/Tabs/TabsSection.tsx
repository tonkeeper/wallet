import React, { createContext, memo } from 'react';
import { Steezy } from '$styles';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useWindowDimensions } from 'react-native';
import { LargeNavBarHeight } from '$shared/constants';
import { statusBarHeight } from '$utils';
import { useTabCtx } from './TabsContainer';

interface TabsSectionProps {
  children?: React.ReactNode;
  index: number;
}

export const TabContext = createContext<{
  index: number;
} | null>(null);

export const useCurrentTab = () => {
  const tab = React.useContext(TabContext);
  
  if (!tab) {
    throw new Error('!no tab context');
  }

  return tab;
}


export const TabsSection = memo<TabsSectionProps>((props) => {
  const dimensions = useWindowDimensions();
  const { activeIndex } = useTabCtx();


  const style = useAnimatedStyle(() => {
    return {
      transform: [{
        translateX: withSpring(-(activeIndex * dimensions.width), {
          damping: 15,
          mass: 0.1,
        }),
      }]
    }
  });

  return (
    <TabContext.Provider value={{ index: props.index }}>
      <Animated.View 
        style={[style, {
          position: 'absolute',
          top: 0,
          left: props.index * dimensions.width,
          right: 0,
          bottom: 0,
          zIndex: 3,
          width: dimensions.width,
          height: dimensions.height - (LargeNavBarHeight + statusBarHeight + 24)
        }]}
      >
        {props.children}
      </Animated.View>
    </TabContext.Provider>
  );
});

const styles = Steezy.create({
  container: {
    
  }
});