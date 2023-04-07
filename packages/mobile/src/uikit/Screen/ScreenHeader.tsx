import Animated, { Extrapolate, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { ScreenHeaderHeight, Header, HeaderProps } from './headers/Header';
import { ScreenLargeHeader } from './ScreenLagreHeader';
import { useScreenScroll } from './hooks';
import React, { memo, useEffect } from 'react';
import { LargeNavBar } from '$uikit/LargeNavBar/LargeNavBar';

type ScreenHeaderProps = HeaderProps & {
  large?: boolean;
};

export const ScreenHeader = memo<ScreenHeaderProps>((props) => {
  const { headerType } = useScreenScroll();

  useEffect(() => {
    headerType.value = props.large ? 'large' : 'screen'
  }, []);


  if (props.large) {
    return (
      <LargeNavBar
        onPress={() => {}}
        bottomComponent={null}
        // scrollTop={scrollY}
        rightContent={null}
        hitSlop={{}}
        // position="absolute"
      >
        {props.title}
      </LargeNavBar>
    );
  }

  return (
    <Header
      backButtonPosition={props.backButtonPosition}
      backButtonIcon={props.backButtonIcon}
      hideBackButton={props.hideBackButton}
      rightContent={props.rightContent}
      onBackPress={props.onBackPress}
      hideTitle={props.hideTitle}
      onGoBack={props.onGoBack}
      gradient={props.gradient}
      isModal={props.isModal}
      title={props.title}
    />
  );
});
