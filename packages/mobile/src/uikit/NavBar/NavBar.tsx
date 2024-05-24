import React, { FC, useCallback, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutChangeEvent, StatusBar, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import * as S from './NavBar.style';
import { NavBarProps } from './NavBar.interface';
import { goBack } from '$navigation/imperative';
import { useTheme } from '$hooks/useTheme';
import { NavBarHeight } from '$shared/constants';
import { convertHexToRGBA, hNs } from '$utils';
import { Text } from '../Text/Text';
import { Icon, Steezy, isIOS } from '@tonkeeper/uikit';

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
    forceBigTitle = false,
    isClosedButton = false,
    onBackPress = undefined,
    onClosePress = undefined,
    onGoBack = undefined,
    isTransparent = false,
    isForceBackIcon = false,
    isBottomButton = false,
    isCancelButton = false,
    withBackground = false,
    fillBackground = false,
    innerAnimatedStyle,
    titleProps = {},
    subtitleProps = {},
    scrollTop,
    subtitle,
  } = props;
  const { top: topInset } = useSafeAreaInsets();
  const theme = useTheme();

  const handleBack = useCallback(() => {
    onGoBack && onGoBack();
    goBack();
  }, [onGoBack]);

  const top = useMemo(() => {
    if (isModal && isIOS) {
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
          <S.BackButtonContainer onPress={onClosePress ?? handleBack}>
            <S.BackButton>
              <Icon name="ic-close-16" color="buttonSecondaryForeground" />
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

  const subtitleHeight = useSharedValue(0);

  const handleSubtitleLayout = useCallback((event: LayoutChangeEvent) => {
    subtitleHeight.value = event.nativeEvent.layout.height;
  }, []);

  const hasSubtitle = !!subtitle;

  const subtitleAnimatedStyle = useAnimatedStyle(
    () => ({
      position: 'relative',
      height: hasSubtitle
        ? withTiming(subtitleHeight.value, { duration: 100 })
        : withTiming(0, { duration: 100 }),
    }),
    [hasSubtitle],
  );

  const isSmallTitle =
    !forceBigTitle && typeof children === 'string' && children.length > 18;

  return (
    <S.Wrap
      style={{ paddingTop: top }}
      isTransparent={isTransparent}
      isBackground={fillBackground}
    >
      {isModal && isIOS ? <StatusBar barStyle="light-content" /> : null}
      {isTransparent && (
        <S.Gradient
          colors={[
            theme.colors.backgroundPrimary,
            convertHexToRGBA(theme.colors.backgroundPrimary, 0),
          ]}
          locations={[0, 1]}
        />
      )}
      <S.Cont style={[borderStyle, innerAnimatedStyle]}>
        <S.Content>
          <S.BackButtonContainer
            onPress={onBackPress || handleBack}
            disabled={hideBackButton}
          >
            <S.BackButton style={backButtonAnimatedStyle}>
              <Icon name={iconName} color="buttonSecondaryForeground" />
            </S.BackButton>
          </S.BackButtonContainer>
          <S.CenterContent style={titleAnimatedStyle}>
            {typeof children === 'string' ? (
              <Text
                textAlign="center"
                variant={isSmallTitle ? 'label1' : 'h3'}
                numberOfLines={1}
                {...titleProps}
              >
                {children}
              </Text>
            ) : (
              children
            )}
            <Animated.View style={subtitleAnimatedStyle}>
              {typeof subtitle === 'string' ? (
                <Text
                  textAlign="center"
                  variant="body2"
                  numberOfLines={1}
                  color="textSecondary"
                  style={styles.subtitle.static}
                  onLayout={handleSubtitleLayout}
                  {...subtitleProps}
                >
                  {subtitle}
                </Text>
              ) : subtitle ? (
                <View style={styles.subtitle.static} onLayout={handleSubtitleLayout}>
                  {subtitle}
                </View>
              ) : null}
            </Animated.View>
          </S.CenterContent>
          {renderRightContent()}
        </S.Content>
      </S.Cont>
    </S.Wrap>
  );
};

const styles = Steezy.create({
  subtitle: {
    position: 'absolute',
    width: '100%',
  },
});
