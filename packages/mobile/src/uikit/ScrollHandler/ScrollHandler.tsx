import React, { FC, useMemo } from 'react';
import { LargeNavBar } from '$uikit/LargeNavBar/LargeNavBar';

import { ScrollHandlerProps } from '$uikit/ScrollHandler/ScrollHandler.interface';
import { NavBar } from '$uikit';
import { Dimensions } from 'react-native';
import { TabletMaxWidth } from '$shared/constants';
import { useScrollHandler } from './useScrollHandler';

const { width: deviceWidth } = Dimensions.get('window');

export const ScrollHandler: FC<ScrollHandlerProps> = (props) => {
  const {
    children,
    navBarTitle,
    navBarRight,
    bottomComponent,
    onPress,
    isLargeNavBar = true,
    hideBackButton,
    hitSlop,
  } = props;

  const { scrollRef, scrollTop, scrollHandler } = useScrollHandler();

  const isBigScreen = deviceWidth > TabletMaxWidth;
  const shouldRenderLargeNavBar = !isBigScreen && isLargeNavBar;

  return useMemo(() => {
    return (
      <>
        {!!navBarTitle && shouldRenderLargeNavBar && (
          <LargeNavBar
            onPress={onPress}
            bottomComponent={bottomComponent}
            scrollTop={scrollTop}
            rightContent={navBarRight}
            hitSlop={hitSlop}
            position="absolute"
          >
            {navBarTitle}
          </LargeNavBar>
        )}
        {!!navBarTitle && !shouldRenderLargeNavBar && (
          <NavBar
            hideBackButton={hideBackButton || (isLargeNavBar && isBigScreen)}
            scrollTop={scrollTop}
            rightContent={navBarRight}
          >
            {navBarTitle}
          </NavBar>
        )}
        {React.cloneElement(children, {
          onScroll: scrollHandler,
          ref: scrollRef,
        })}
      </>
    );
  }, [scrollTop, hideBackButton, navBarTitle, children, scrollHandler]);
};
