import Animated, { Extrapolate, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { ScreenLargeHeader } from './ScreenLagreHeader';
import { NavBarHeight } from '$shared/constants';
import { useScreenScroll } from './hooks';
import { NavBar } from '../NavBar/NavBar';
import React, { memo } from 'react';
import { Steezy } from '$styles';

interface ScreenHeaderProps {
  title?: string;
  rightContent?: React.ReactNode;
  hideBackButton?: boolean;
  large?: boolean;
}

export const ScreenHeader = memo<ScreenHeaderProps>((props) => {
  const { rightContent, hideBackButton } = props;
  const screenScroll = useScreenScroll();

  const ejectionOpacityStyle = useAnimatedStyle(() => {
    if (screenScroll.headerEjectionPoint.value > 0) {
      const start = screenScroll.headerEjectionPoint.value - NavBarHeight + 11;
      const opacity = interpolate(
        screenScroll.scrollY.value,
        [0, start, start + (NavBarHeight / 3.5)],
        [1, 1, 0],
        Extrapolate.CLAMP
      );

      return { opacity };
    }

    return {};
  });

  const ejectionShiftStyle = useAnimatedStyle(() => {
    if (screenScroll.headerEjectionPoint.value > 0) {
      const start = screenScroll.headerEjectionPoint.value - NavBarHeight;

      const y = interpolate(
        screenScroll.scrollY.value,
        [0, start, start + (NavBarHeight / 3.5)],
        [0, 0, -(NavBarHeight / 3.5)],
      );;

      return {
        transform: [{ translateY: y }]
      };
    }

    return {};
  });

  const rightContentContainer = React.useMemo(() => {
    if (rightContent) {
      return rightContent;
    }

    return null;
  }, [rightContent]);


  if (props.large) {
    return (
      <ScreenLargeHeader 
        navBarTitle={props.title!}
        scrollTop={screenScroll.scrollY}
      />
    )
  }

  return (
    <Animated.View
      style={[
        { zIndex: 3 },
        ejectionShiftStyle
      ]}
    >
      <NavBar
        innerAnimatedStyle={ejectionOpacityStyle}
        rightContent={rightContentContainer} 
        scrollTop={screenScroll.scrollY}
        hideBackButton={hideBackButton}
        fillBackground
      >
        {props.title}
      </NavBar>
    </Animated.View>
  );

});

const styles = Steezy.create(({ colors }) => ({

}));