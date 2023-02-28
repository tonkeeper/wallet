import React, { FC, useCallback, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import * as S from './NavBar.style';
import { NavBarProps } from './NavBar.interface';
import { goBack } from '$navigation';
import { Icon } from '$uikit/Icon/Icon';
import { useTheme } from '$hooks';
import { NavBarHeight } from '$shared/constants';
import { hNs } from '$utils';

export const NavBarHelper: FC = () => {
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={{
        height: hNs(NavBarHeight) + top,
      }}
    />
  );
};

export const NavBar: FC<NavBarProps> = (props) => {
  const {
    isModal,
    children,
    rightContent = null,
    hideBackButton = false,
    hideTitle = false,
    isClosedButton = false,
    onBackPress = undefined,
    onGoBack = undefined,
    isTransparent = false,
    isForceBackIcon = false,
    isBottomButton = false,
    isCancelButton = false,
    withBackground = false,
    titleProps = {},
    scrollTop,
  } = props;
  const { top: topInset } = useSafeAreaInsets();
  const theme = useTheme();

  const handleBack = useCallback(() => {
    onGoBack && onGoBack();
    goBack();
  }, [onGoBack]);

  const top = useMemo(() => {
    if (isModal) {
      return 0;
    } else {
      return topInset;
    }
  }, [isModal, topInset]);

  const iconName = useMemo(() => {
    if (isCancelButton) {
      return 'ic-close-16';
    } else if ((isModal && !isForceBackIcon) || isBottomButton) {
      return 'ic-chevron-down-16';
    } else {
      return 'ic-chevron-left-16';
    }
  }, [isModal, isForceBackIcon, isBottomButton, isCancelButton]);

  const borderStyle = useAnimatedStyle(() => {
    return {
      borderBottomColor:
        scrollTop && scrollTop.value > 0 ? theme.colors.border : 'transparent',
      backgroundColor: withBackground ? theme.colors.backgroundPrimary : undefined,
    };
  });

  function renderRightContent() {
    if (rightContent) {
      return (
        <S.RightContent>
          {typeof rightContent === 'function' ? rightContent() : rightContent}
        </S.RightContent>
      );
    }

    if (isClosedButton) {
      return (
        <S.RightContent>
          <S.BackButtonContainer onPress={handleBack}>
            <S.BackButton>
              <Icon name="ic-close-16" color="foregroundPrimary" />
            </S.BackButton>
          </S.BackButtonContainer>
        </S.RightContent>
      );
    }

    return null;
  }

  const backButtonAnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: withTiming(hideBackButton ? 0 : 1),
    }),
    [hideBackButton],
  );

  const titleAnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: withTiming(children && !hideTitle ? 1 : 0),
    }),
    [children, hideTitle],
  );

  return (
    <S.Wrap style={{ paddingTop: top }} isTransparent={isTransparent}>
      {isTransparent && (
        <S.Gradient
          colors={[theme.colors.backgroundPrimary, 'rgba(21, 28, 41, 0)']}
          locations={[0, 1]}
        />
      )}
      <S.Cont style={borderStyle}>
        <S.Content>
          <S.BackButtonContainer
            onPress={onBackPress || handleBack}
            disabled={hideBackButton}
          >
            <S.BackButton style={backButtonAnimatedStyle}>
              <Icon name={iconName} color="foregroundPrimary" />
            </S.BackButton>
          </S.BackButtonContainer>
          <S.Title {...titleProps} style={titleAnimatedStyle}>
            {children}
          </S.Title>
          {renderRightContent()}
        </S.Content>
      </S.Cont>
    </S.Wrap>
  );
};
