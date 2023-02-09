import React, { FC, useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  LargeNavBar,
} from '$uikit/LargeNavBar/LargeNavBar';

import { NavBar } from '$uikit';
import { Dimensions } from 'react-native';
import { TabletMaxWidth } from '$shared/constants';
import { useScreenScroll } from './context/ScreenScrollContext';

const { width: deviceWidth } = Dimensions.get('window');

export const ScreenLargeHeader: FC<any> = (props) => {
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

  return useMemo(() => {
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
  }, [navBarTitle, children]);
};
