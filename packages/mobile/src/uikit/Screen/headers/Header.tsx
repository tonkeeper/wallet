import Animated, { Extrapolate, interpolate, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { StyleSheet, TouchableOpacity, ViewStyle, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { IconNames } from '$uikit/Icon/generated.types';
import React, { useCallback, memo } from 'react';
import { useScreenScroll } from '../hooks';
import { Icon } from '$uikit/Icon/Icon';
import { goBack } from '$navigation';
import { useTheme } from '$hooks';
import { Text } from '$uikit';

type BackButtonIcon = 'back' | 'close' | 'down';

export interface HeaderProps {
  backButtonPosition?: 'left' | 'right';
  backButtonIcon?: BackButtonIcon;
  rightContent?: React.ReactNode;
  hideBackButton?: boolean;
  hideTitle?: boolean;
  gradient?: boolean;
  isModal?: boolean;
  title?: string;
  onBackPress?: () => void;
  onGoBack?: () => void;
}

const backButtonIcons: { [key in BackButtonIcon]: IconNames } = {
  down: 'ic-chevron-down-16',
  back: 'ic-chevron-left-16',
  close: 'ic-close-16',
};

export const ScreenHeaderHeight = 64;

export const Header = memo<HeaderProps>((props) => {
  const {
    backButtonPosition = 'left',
    backButtonIcon = 'back',
    hideBackButton = false,
    rightContent = null,
    hideTitle = false,
    onBackPress,
    onGoBack,
    gradient,
    isModal,
    title,
  } = props;

  const { scrollY, headerEjectionPoint } = useScreenScroll();
  const safeArea = useSafeAreaInsets();
  const theme = useTheme();

  const handleBack = useCallback(() => {
    onGoBack && onGoBack();
    goBack();
  }, [onGoBack]);

  const backButtonIconName = backButtonIcons[backButtonIcon];

  const borderStyle = useAnimatedStyle(() => ({
    borderBottomColor: scrollY.value > 0 ? theme.colors.border : 'transparent',
  }));

  const backButtonAnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: withTiming(hideBackButton ? 0 : 1),
    }),
    [hideBackButton],
  );

  const titleAnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: withTiming(title && !hideTitle ? 1 : 0),
    }),
    [title, hideTitle],
  );

  const ejectionOpacityStyle = useAnimatedStyle(() => {
    if (headerEjectionPoint.value > 0) {
      const start = headerEjectionPoint.value - ScreenHeaderHeight + 11;
      const opacity = interpolate(
        scrollY.value,
        [0, start, start + ScreenHeaderHeight / 3.5],
        [1, 1, 0],
        Extrapolate.CLAMP,
      );

      return { opacity };
    }

    return {};
  });

  const ejectionShiftStyle = useAnimatedStyle(() => {
    if (headerEjectionPoint.value > 0) {
      const start = headerEjectionPoint.value - ScreenHeaderHeight;

      const y = interpolate(
        scrollY.value,
        [0, start, start + ScreenHeaderHeight / 3.5],
        [0, 0, -(ScreenHeaderHeight / 3.5)],
      );

      return {
        transform: [{ translateY: y }],
        zIndex: 3,
      };
    }

    return {};
  });

  const isSmallTitle = typeof title === 'string' && title.length > 18;

  const backButtonSlot = (
    <TouchableOpacity
      onPress={onBackPress ?? handleBack}
      style={styles.leftContainer}
      disabled={hideBackButton}
    >
      <Animated.View
        style={[
          styles.backButton,
          backButtonAnimatedStyle,
          { backgroundColor: theme.colors.backgroundSecondary },
        ]}
      >
        <Icon name={backButtonIconName} color="foregroundPrimary" />
      </Animated.View>
    </TouchableOpacity>
  );

  const isBackButtonRight = backButtonPosition === 'right';
  const rightContentSlot = isBackButtonRight ? backButtonSlot : rightContent;

  return (
    <Animated.View style={ejectionShiftStyle}>
      <View
        style={[
          styles.container,
          !gradient && { backgroundColor: theme.colors.backgroundPrimary },
          !isModal && { paddingTop: safeArea.top },
          gradient && styles.absolute,
        ]}
      >
        {gradient && (
          <LinearGradient
            colors={[theme.colors.backgroundPrimary, 'rgba(21, 28, 41, 0)']}
            style={styles.gradient}
            locations={[0, 1]}
          />
        )}
        <Animated.View style={[styles.innerContainer, ejectionOpacityStyle, borderStyle]}>
          <View style={styles.content}>
            {!hideBackButton && !isBackButtonRight && backButtonSlot}
            <Text
              style={[styles.titleText, titleAnimatedStyle]}
              variant={isSmallTitle ? 'label1' : 'h3'}
              textAlign="center"
              numberOfLines={1}
              reanimated
            >
              {title}
            </Text>
            {rightContentSlot && (
              <View style={styles.rightContent}>{rightContentSlot}</View>
            )}
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  absolute: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 1,
  },
  innerContainer: {
    height: ScreenHeaderHeight - StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'transparent',
    zIndex: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
  },
  titleText: {
    marginHorizontal: ScreenHeaderHeight - 24,
    zIndex: 1,
    flex: 1,
  },
  leftContainer: {
    height: ScreenHeaderHeight,
    width: ScreenHeaderHeight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
  },
  rightContent: {
    height: ScreenHeaderHeight,
    minWidth: ScreenHeaderHeight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 2,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32 / 2,
    height: 32,
    width: 32,
  },
});
