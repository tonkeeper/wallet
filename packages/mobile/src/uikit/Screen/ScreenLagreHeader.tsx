import React, { memo } from 'react';
import { LargeNavBar } from '../LargeNavBar/LargeNavBar';

import { NavBar } from '../NavBar/NavBar';
import { Dimensions } from 'react-native';
import { TabletMaxWidth } from '$shared/constants';
import { LargeNavBarProps } from '../LargeNavBar/LargeNavBar.interface';
import { SharedValue } from 'react-native-reanimated';

const { width: deviceWidth } = Dimensions.get('window');

interface ScreenLargeHeaderProps extends LargeNavBarProps {
  navBarTitle: string;
  isLargeNavBar?: boolean;
  navBarRight?: React.ReactNode;
  scrollTop: SharedValue<number>;
}

export const ScreenLargeHeader = memo<ScreenLargeHeaderProps>((props) => {
  const {
    navBarTitle,
    navBarRight,
    bottomComponent,
    onPress,
    isLargeNavBar = true,
    hitSlop,
    scrollTop,
  } = props;

  const isBigScreen = deviceWidth > TabletMaxWidth;
  const shouldRenderLargeNavBar = !isBigScreen && isLargeNavBar;

  return (
    <>
      {!!navBarTitle && shouldRenderLargeNavBar && (
        <LargeNavBar
          onPress={onPress}
          bottomComponent={bottomComponent}
          scrollTop={scrollTop}
          rightContent={navBarRight}
          hitSlop={hitSlop}
          position="relative"
        >
          {navBarTitle}
        </LargeNavBar>
      )}
      {!!navBarTitle && !shouldRenderLargeNavBar && (
        <NavBar
          hideBackButton={isLargeNavBar && isBigScreen}
          scrollTop={scrollTop}
          rightContent={navBarRight}
        >
          {navBarTitle}
        </NavBar>
      )}
    </>
  );
});
