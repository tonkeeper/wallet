import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { StyleSheet, TouchableOpacity, ViewStyle, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { IconNames } from '$uikit/Icon/generated.types';
import React, { useCallback, memo } from 'react';
import { useScreenScroll } from './hooks';
import { Icon } from '$uikit/Icon/Icon';
import { goBack } from '$navigation';
import { useTheme } from '$hooks/useTheme';
import { Text } from '../Text';

type BackButtonIcon = 'back' | 'close' | 'down';

export interface ScreenNormalHeaderProps {
  backButtonPosition?: 'left' | 'right';
  backButtonIcon?: BackButtonIcon;
  innerAnimatedStyle?: ViewStyle;
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

export const ScreenNormalHeader = memo<ScreenNormalHeaderProps>((props) => {
  const {
    backButtonPosition = 'left',
    backButtonIcon = 'back',
    hideBackButton = false,
    rightContent = null,
    innerAnimatedStyle,
    hideTitle = false,
    onBackPress,
    onGoBack,
    gradient,
    isModal,
    title,
  } = props;

  const { scrollY } = useScreenScroll();
  const safeArea = useSafeAreaInsets();
  const theme = useTheme();

  const handleBack = useCallback(() => {
    onGoBack && onGoBack();
    goBack();
  }, [onGoBack]);

  const backButtonIconName = backButtonIcons[backButtonIcon];

  const borderStyle = useAnimatedStyle(() => ({
    borderBottomColor: scrollY.value > 0 ? theme.colors.border : 'transparent'
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

  const isSmallTitle = typeof title === 'string' && title.length > 18;

  const backButton = (
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

  return (
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
      <Animated.View
        style={[styles.innerContainer, innerAnimatedStyle, borderStyle]}
      >
        <View style={styles.content}>
          {!hideBackButton && backButton}
          <Text
            style={[styles.titleText, titleAnimatedStyle]}
            variant={isSmallTitle ? 'label1' : 'h3'}
            textAlign="center"
            numberOfLines={1}
            reanimated
          >
            {title}
          </Text>
          {rightContent && (
            <View style={styles.rightContent}>
              {rightContent}
            </View>
          )}
        </View>
      </Animated.View>
    </View>
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
