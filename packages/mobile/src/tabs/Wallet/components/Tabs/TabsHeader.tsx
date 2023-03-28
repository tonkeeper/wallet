import { useTheme } from '$hooks';
import { isAndroid } from '$utils';
import * as React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTabCtx } from './TabsContainer';

interface TabsHeaderProps {
  
}

export const TabsHeader: React.FC<TabsHeaderProps> = (props) => {
  const dimensions = useWindowDimensions();
  const theme = useTheme();
  const { headerHeight, scrollY } = useTabCtx();

  
  const balanceStyle = useAnimatedStyle(() => {
    return {
      transform: [{ 
        translateY: -(scrollY.value)
      }]
    }
  });

  
  return (
    <Animated.View
      pointerEvents="box-none"
      style={[balanceStyle, {
        position: 'absolute',
        top: 0,
        zIndex: isAndroid ? 1 : 4,
        width: dimensions.width,
        backgroundColor: theme.colors.backgroundPrimary
      }]}
      onLayout={(ev) => {
        headerHeight.value = ev.nativeEvent.layout.height;
      }}
    >
      {props.children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    
  }
});