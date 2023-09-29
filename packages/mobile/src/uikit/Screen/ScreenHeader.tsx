import React, { memo } from 'react';
import { ViewStyle } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import { useMaybeTabCtx } from '../../tabs/Wallet/components/Tabs/TabsContainer';
import { NavBar } from '../NavBar/NavBar';
import { useScreenScroll } from './context/ScreenScrollContext';
import { ScreenLargeHeader } from './ScreenLagreHeader';

interface ScreenHeaderProps {
  title?: string | React.ReactNode;
  rightContent?: React.ReactNode;
  backButton?: boolean;
  large?: boolean;
  customNavBar?: (
    opacityMainHeaderStyle: SharedValue<number> | undefined,
  ) => React.ReactNode;
}

export const ScreenHeader = memo<ScreenHeaderProps>((props) => {
  const { rightContent, backButton = true } = props;
  const screenScroll = useScreenScroll();
  const tabsCtx = useMaybeTabCtx();

  const rightContentContainer = React.useMemo(() => {
    if (rightContent) {
      return rightContent;
    }

    return null;
  }, [rightContent]);

  if (props.customNavBar) {
    return props.customNavBar(tabsCtx?.scrollY ?? screenScroll.scrollY);
  }

  if (props.large) {
    return (
      <ScreenLargeHeader
        navBarTitle={props.title!}
        scrollTop={tabsCtx?.scrollY ?? screenScroll.scrollY}
      />
    );
  }

  return (
    <Animated.View style={[{ zIndex: 3 }, tabsCtx?.shiftMainHeaderStyle]}>
      <NavBar
        rightContent={rightContentContainer}
        hideBackButton={!backButton}
        fillBackground
        scrollTop={tabsCtx?.scrollY ?? screenScroll.scrollY}
        innerAnimatedStyle={tabsCtx?.opacityMainHeaderStyle}
      >
        {props.title}
      </NavBar>
    </Animated.View>
  );
});
