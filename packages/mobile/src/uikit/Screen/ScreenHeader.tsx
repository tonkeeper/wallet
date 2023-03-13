import { Steezy } from '$styles';
import { View } from '$uikit/StyledNativeComponents';
import { Text } from '$uikit/Text/Text';
import React, { memo } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMaybeTabCtx } from '../../tabs/Wallet/components/Tabs/TabsContainer';
import { NavBar } from '../NavBar/NavBar';
import { ScreenLargeHeader } from './ScreenLagreHeader';

interface ScreenHeaderProps {
  title?: string;
  rightContent?: React.ReactNode;
  backButton?: boolean;
  large?: boolean;
}

export const ScreenHeader = memo<ScreenHeaderProps>((props) => {
  const { rightContent, backButton = true } = props;
  const { top: topInset } = useSafeAreaInsets();
  const dimensions = useWindowDimensions();
  const tabsCtx = useMaybeTabCtx();

  const rightContentContainer = React.useMemo(() => {
    if (rightContent) {
      return rightContent;
    }

    return null;
  }, [rightContent]);


  if (props.large) {
    return (
      <ScreenLargeHeader 
        navBarTitle={props.title}
      />
    )
  }

  return (
    <Animated.View
      style={[
        { zIndex: 3 },
        tabsCtx?.shiftMainHeaderStyle
      ]}
    >
      <NavBar 
        rightContent={rightContentContainer} 
        hideBackButton={!backButton}
        fillBackground
        scrollTop={tabsCtx?.scrollY}
        innerAnimatedStyle={tabsCtx?.opacityMainHeaderStyle}
      >
        {props.title}
      </NavBar>
    </Animated.View>
  );

});

const styles = Steezy.create(({ colors }) => ({

}));