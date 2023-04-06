import React, { memo } from 'react';
import {
  LargeNavBar,
} from '$uikit/LargeNavBar/LargeNavBar';

import { NavBar } from '$uikit';
import { Dimensions } from 'react-native';
import { TabletMaxWidth } from '$shared/constants';
import { useScreenScroll } from './hooks';
import { LargeNavBarProps } from '$uikit/LargeNavBar/LargeNavBar.interface';

const { width: deviceWidth } = Dimensions.get('window');

interface ScreenLargeHeaderProps extends LargeNavBarProps {
  navBarTitle: string;
  isLargeNavBar?: boolean;
  navBarRight?: React.ReactNode;
}

export const ScreenLargeHeader = memo<ScreenLargeHeaderProps>((props) => {
  const {
    children,
    navBarTitle,
    navBarRight,
    bottomComponent,
    onPress,
    isLargeNavBar = true,
    hitSlop
  } = props;

  const { contentScrollY } = useScreenScroll();
  
  const isBigScreen = deviceWidth > TabletMaxWidth;
  const shouldRenderLargeNavBar = !isBigScreen && isLargeNavBar;

  return (
    <>
      {!!navBarTitle && shouldRenderLargeNavBar && (
        <LargeNavBar
          onPress={onPress}
          bottomComponent={bottomComponent}
          scrollTop={contentScrollY}
          rightContent={navBarRight}
          hitSlop={hitSlop}
          position="absolute"
        >
          {navBarTitle}
        </LargeNavBar>
      )}
      {!!navBarTitle && !shouldRenderLargeNavBar && (
        <NavBar
          hideBackButton={isLargeNavBar && isBigScreen}
          scrollTop={contentScrollY}
          rightContent={navBarRight}
        >
          {navBarTitle}
        </NavBar>
      )}
    </>
  );
});
