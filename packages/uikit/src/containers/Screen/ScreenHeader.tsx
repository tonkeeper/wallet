import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, IconNames } from '../../components/Icon';
import { ScreenHeaderHeight } from './utils/constants';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, memo } from 'react';
import { isString } from '../../utils/strings';
import { useRouter } from '@tonkeeper/router';
import { Text } from '../../components/Text';
import { useScreenScroll } from './hooks';
import { useTheme } from '../../styles';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { convertHexToRGBA } from '@tonkeeper/mobile/src/utils';

type BackButtonIcon = 'back' | 'close' | 'down';

const backButtonIcons: { [key in BackButtonIcon]: IconNames } = {
  down: 'ic-chevron-down-16',
  back: 'ic-chevron-left-16',
  close: 'ic-close-16',
};

export interface ScreenHeaderProps {
  backButtonPosition?: 'left' | 'right';
  backButtonIcon?: BackButtonIcon;
  rightContent?: React.ReactNode;
  hideBackButton?: boolean;
  hideTitle?: boolean;
  gradient?: boolean;
  isModal?: boolean;
  titlePosition?: 'center' | 'left';
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children?: React.ReactNode;
  onBackPress?: () => void;
  onGoBack?: () => void;
  showCloseButton?: boolean;
  alternateBackground?: boolean;
  trasnparent?: boolean;
}

export const ScreenHeader = memo<ScreenHeaderProps>((props) => {
  const {
    showCloseButton,
    backButtonPosition = 'left',
    backButtonIcon = 'back',
    titlePosition = 'center',
    hideBackButton,
    rightContent,
    hideTitle,
    gradient,
    isModal,
    title,
    children,
    onBackPress,
    onGoBack,
    subtitle,
    alternateBackground,
    trasnparent,
  } = props;

  const { scrollY, headerEjectionPoint } = useScreenScroll();
  const safeArea = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();

  const handleBack = useCallback(() => {
    onGoBack && onGoBack();
    router.goBack();
  }, [onGoBack]);

  const backButtonIconName = backButtonIcons[backButtonIcon];

  const borderStyle = useAnimatedStyle(() => ({
    borderBottomColor: scrollY.value > 0 ? theme.separatorCommon : 'transparent',
  }));

  const backButtonAnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: withTiming(hideBackButton ? 0 : 1),
    }),
    [hideBackButton],
  );

  const hasTitle = !!title;
  const titleAnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: withTiming(hasTitle && !hideTitle ? 1 : 0),
    }),
    [hasTitle, hideTitle],
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
        Math.max(0, scrollY.value),
        [0, start, start + ScreenHeaderHeight / 3.5],
        [0, 0, -(ScreenHeaderHeight / 3.5)],
      );

      return {
        transform: [{ translateY: y }],
      };
    }

    return {};
  });

  const isSmallTitle = typeof title === 'string' && title.length <= 18;

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
          { backgroundColor: theme.buttonSecondaryBackground },
        ]}
      >
        <Icon name={backButtonIconName} />
      </Animated.View>
    </TouchableOpacity>
  );

  const isBackButtonRight = backButtonPosition === 'right';
  const rightContentSlot = isBackButtonRight ? backButtonSlot : rightContent;
  const headerHeight = isModal ? ScreenHeaderHeight : ScreenHeaderHeight + safeArea.top;

  return (
    <React.Fragment>
      {!gradient && <View style={{ paddingTop: headerHeight }} />}
      <Animated.View
        style={[
          { height: headerHeight },
          styles.container,
          ejectionShiftStyle,
          !gradient &&
            !trasnparent && {
              backgroundColor: alternateBackground
                ? theme.backgroundPageAlternate
                : theme.backgroundPage,
            },
          !isModal && { paddingTop: safeArea.top },
          styles.absolute,
        ]}
      >
        {gradient && (
          <LinearGradient
            colors={[theme.backgroundPage, convertHexToRGBA(theme.backgroundPage, 0)]}
            style={styles.gradient}
            locations={[0, 1]}
          />
        )}
        <Animated.View
          style={[styles.innerContainer, ejectionOpacityStyle, !gradient && borderStyle]}
        >
          <View style={styles.content}>
            {children ?? (
              <>
                {!hideBackButton && !isBackButtonRight && backButtonSlot}
                {isString(title) ? (
                  <View
                    style={[
                      styles.titleContainer,
                      titlePosition === 'left' && styles.titleContainerPositionLeft,
                    ]}
                  >
                    <Text
                      style={[styles.title, titleAnimatedStyle]}
                      type={!isSmallTitle ? 'label1' : 'h3'}
                      textAlign={titlePosition}
                      numberOfLines={1}
                      reanimated
                    >
                      {title}
                    </Text>
                    {isString(subtitle) ? (
                      <Text
                        textAlign="center"
                        type="body2"
                        numberOfLines={1}
                        color="textSecondary"
                      >
                        {subtitle}
                      </Text>
                    ) : (
                      subtitle
                    )}
                  </View>
                ) : (
                  <View style={styles.titleContainer}>{title}</View>
                )}
              </>
            )}
          </View>
          {rightContentSlot && (
            <View style={styles.rightContent}>{rightContentSlot}</View>
          )}
        </Animated.View>
      </Animated.View>
    </React.Fragment>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
  titleContainer: {
    flex: 1,
    marginHorizontal: ScreenHeaderHeight - 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainerPositionLeft: {
    alignItems: 'flex-start',
    marginLeft: 0,
    marginRight: ScreenHeaderHeight - 24,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    zIndex: 1,
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
