import React, { FC, useMemo } from 'react';
import { LargeNavBar } from '../LargeNavBar/LargeNavBar';

import { ScrollHandlerProps } from '../ScrollHandler/ScrollHandler.interface';
import { NavBar } from '../NavBar/NavBar';
import { Dimensions } from 'react-native';
import { TabletMaxWidth } from '$shared/constants';
import { useScrollHandler } from './useScrollHandler';

const { width: deviceWidth } = Dimensions.get('window');

export const ScrollHandler: FC<ScrollHandlerProps> = (props) => {
  const {
    children,
    navBarTitle,
    navBarSubtitle,
    navBarRight,
    bottomComponent,
    onPress,
    isLargeNavBar = true,
    hideBackButton,
    hitSlop,
    subtitleProps = {},
    titleProps = {},
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
            titleProps={titleProps}
            hideBackButton={hideBackButton || (isLargeNavBar && isBigScreen)}
            scrollTop={scrollTop}
            rightContent={navBarRight}
            subtitle={navBarSubtitle}
            subtitleProps={subtitleProps}
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
  }, [
    navBarTitle,
    shouldRenderLargeNavBar,
    onPress,
    bottomComponent,
    scrollTop,
    navBarRight,
    hitSlop,
    titleProps,
    hideBackButton,
    isLargeNavBar,
    isBigScreen,
    navBarSubtitle,
    children,
    scrollHandler,
    scrollRef,
  ]);
};
