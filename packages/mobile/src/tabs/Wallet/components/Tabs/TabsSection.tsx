import React, { createContext, memo } from 'react';
import { Steezy } from '$styles';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useWindowDimensions, View } from 'react-native';
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
          stiffness: 1000,
            damping: 500,
            mass: 3,
            overshootClamping: true,
            restDisplacementThreshold: 10,
            restSpeedThreshold: 10,
        }),
      }]
    }
  });

  return (
    <View style={styles.container.static} key={`${props.index}`}>
      <TabContext.Provider value={{ index: props.index }}>
        {props.children}
      </TabContext.Provider>
    </View>
  );
});

const styles = Steezy.create({
  container: {
    flex: 1,
  }
});