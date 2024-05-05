import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSheetInternal } from '@tonkeeper/router';
import { IconNames } from '../../../components/Icon';
import { Text } from '../../../components/Text';
import { Icon } from '../../../components/Icon';
import { memo, useLayoutEffect } from 'react';
import { useTheme } from '../../../styles';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { convertHexToRGBA } from '@tonkeeper/mobile/src/utils';

export interface SheetModalHeaderProps {
  onIconLeftPress?: () => void;
  onClose?: () => void;
  iconLeft?: IconNames;
  leftContent?: React.ReactNode;
  gradient?: boolean;
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  center?: boolean;
  numberOfLines?: number;
}

export const SheetModalHeader = memo<SheetModalHeaderProps>((props) => {
  const {
    gradient,
    title,
    subtitle,
    onClose,
    iconLeft,
    onIconLeftPress,
    leftContent,
    center,
  } = props;
  const { measureHeader, close, scrollY } = useSheetInternal();
  const theme = useTheme();

  const hasTitle = !!title;
  const hasSubtitle = !!subtitle;

  const borderAnimatedStyle = useAnimatedStyle(
    () => ({
      borderBottomColor:
        hasTitle && scrollY.value > 0 ? theme.separatorAlternate : 'transparent',
    }),
    [hasTitle],
  );

  useLayoutEffect(() => {
    if (hasSubtitle) {
      measureHeader({
        nativeEvent: {
          layout: { height: 84 },
        },
      });

      return;
    }
    if (hasTitle) {
      measureHeader({
        nativeEvent: {
          layout: { height: 64 },
        },
      });
    }
  }, [hasTitle]);

  return (
    <Animated.View
      style={[
        styles.container,
        hasSubtitle && styles.containerWithSubtitle,
        borderAnimatedStyle,
        !hasTitle && styles.absolute,
      ]}
    >
      {gradient && (
        <LinearGradient
          colors={[theme.backgroundContent, convertHexToRGBA(theme.backgroundContent, 0)]}
          style={styles.gradient}
          locations={[0, 1]}
        />
      )}
      <View style={{ flexDirection: 'row', flex: 1 }}>
        {iconLeft ? (
          <TouchableOpacity
            style={[styles.closeButton, styles.leftButton]}
            activeOpacity={0.6}
            onPress={() => {
              onIconLeftPress?.();
            }}
          >
            <View style={[styles.close, { backgroundColor: theme.backgroundContent }]}>
              <Icon name={iconLeft} color="constantWhite" />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.leftContent}>{leftContent}</View>
        )}

        {hasTitle && (
          <View style={[styles.headerTitle, center && styles.titleByCenter]}>
            {typeof title === 'string' ? (
              <Text
                numberOfLines={props.numberOfLines}
                type="h3"
                textAlign={center ? 'center' : 'left'}
              >
                {title}
              </Text>
            ) : (
              title
            )}
            {hasSubtitle &&
              (typeof subtitle === 'string' ? (
                <Text type="body2" color="textSecondary">
                  {subtitle}
                </Text>
              ) : (
                subtitle
              ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.closeButton, styles.rightButton]}
          activeOpacity={0.6}
          onPress={() => {
            close();
            onClose?.();
          }}
        >
          <View
            style={[styles.close, { backgroundColor: theme.buttonSecondaryBackground }]}
          >
            <Icon name="ic-close-16" />
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: 64,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  containerWithSubtitle: {
    height: 84,
  },
  absolute: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    zIndex: 3,
  },
  headerTitle: {
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  titleByCenter: {
    flex: 1,
    marginHorizontal: 24,
    textAlign: 'center',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 46,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  closeButton: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',

    position: 'absolute',
    top: 0,
    zIndex: 2,
  },
  rightButton: {
    right: 0,
  },
  leftButton: {
    left: 0,
  },
  leftContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
    height: 64,
    justifyContent: 'center',
    paddingLeft: 16,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 32 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
