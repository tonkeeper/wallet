import React, { memo, useCallback } from 'react';
import { TextStyle, ViewStyle } from 'react-native';
import { Steezy, StyleProp } from '$styles';
import { View, useTheme } from '@tonkeeper/uikit';
import { SText } from '../StyledNativeComponents';
import { Icon } from '../Icon/Icon';
import { Pressable } from '../Pressable';
import { TonThemeColor } from '$styled';
import FastImage from 'react-native-fast-image';
import Animated, {
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { isAndroid } from '$utils';
import { TextProps } from '../Text/Text';

type LeftContentFN = (isPressed: Animated.SharedValue<boolean>) => React.ReactNode;

export interface ListItemProps {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  value?: string | React.ReactNode;
  subvalue?: string | React.ReactNode;
  label?: string | React.ReactNode;
  chevronColor?: TonThemeColor;
  pictureStyle?: StyleProp<ViewStyle>;
  compact?: boolean;
  isLast?: boolean;
  underlayColor?: string;
  isFirst?: boolean;
  disabled?: boolean;
  titleProps?: TextProps;
  leftContentStyle?: StyleProp<ViewStyle>;

  titleStyle?: ViewStyle;
  /*
    Shared value that will be updated when user press on ListItem
 */
  isPressedSharedValue?: SharedValue<boolean>;
  valueStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;

  picture?: string;

  chevron?: boolean;
  checkmark?: boolean;

  leftContent?: LeftContentFN | React.ReactNode;
  rightContent?: () => React.ReactElement;

  onPress?: () => void;
}

export const ListItem = memo<ListItemProps>((props) => {
  const isPressed = useSharedValue(false);
  const { compact = true, titleProps = {} } = props;

  const handlePressIn = useCallback(() => {
    isPressed.value = true;
  }, []);

  const handlePressOut = useCallback(() => {
    isPressed.value = false;
  }, []);

  useDerivedValue(() => {
    props.isPressedSharedValue && (props.isPressedSharedValue.value = isPressed.value);
  }, [isPressed]);

  const leftContent = React.useMemo(() => {
    if (typeof props.leftContent === 'function') {
      return props.leftContent(isPressed);
    }

    return props.leftContent;
  }, [isPressed, props.leftContent]);

  const hasLeftContent = !!leftContent || !!props.picture;
  const pictureSource = { uri: props.picture };

  const TouchableComponent = isAndroid ? Pressable : TouchableHighlight;
  const renderTitle = useCallback(() => {
    return (
      <View style={[styles.title, props.titleStyle]}>
        <View style={styles.titleTextContainer}>
          {typeof props.title === 'string' ? (
            <SText
              style={styles.titleText}
              variant={compact ? 'label1' : 'body2'}
              color={compact ? 'textPrimary' : 'textSecondary'}
              numberOfLines={1}
              ellipsizeMode="tail"
              {...titleProps}
            >
              {props.title}
            </SText>
          ) : (
            props.title
          )}
          {typeof props.label === 'string' ? (
            <SText
              style={styles.labelText}
              color="textTertiary"
              variant="label1"
              numberOfLines={1}
            >
              {props.label}
            </SText>
          ) : (
            props.label
          )}
        </View>

        {typeof props.subtitle === 'string' ? (
          <SText
            variant="body2"
            color={compact ? 'textSecondary' : 'textPrimary'}
            numberOfLines={1}
          >
            {props.subtitle}
          </SText>
        ) : (
          props.subtitle
        )}
      </View>
    );
  }, [props.title, props.label, props.subtitle, compact, titleProps]);

  const theme = useTheme();

  return (
    <TouchableComponent
      underlayColor={props.underlayColor ?? theme.backgroundHighlighted}
      onPressOut={handlePressOut}
      onPressIn={handlePressIn}
      onPress={props.onPress}
      disabled={!props.onPress || props.disabled}
    >
      <View
        style={[
          styles.container.static,
          compact && styles.containerCompact.static,
          props.containerStyle,
        ]}
      >
        {hasLeftContent && (
          <View style={[styles.leftContent, props.leftContentStyle]}>
            {leftContent}
            {!!props.picture && (
              <View style={[styles.pictureContainer, props.pictureStyle]}>
                <FastImage style={[styles.picture.static]} source={pictureSource} />
              </View>
            )}
          </View>
        )}
        {renderTitle()}
        <View style={styles.valueContainer}>
          {typeof props.value === 'string' ? (
            <SText variant="label1" style={[styles.valueText, props.valueStyle]}>
              {`  ${props.value}`}
            </SText>
          ) : (
            props.value
          )}

          {typeof props.subvalue === 'string' ? (
            <SText variant="body2" style={styles.subvalueText}>
              {props.subvalue}
            </SText>
          ) : (
            props.subvalue
          )}

          <View style={styles.rightContent}>
            {props.rightContent}
            {props.chevron && (
              <Icon color={props.chevronColor} name="ic-chevron-right-16" />
            )}
            {props.checkmark && (
              <Icon color={'accentPrimary'} name="ic-donemark-thin-28" />
            )}
          </View>
        </View>
      </View>
    </TouchableComponent>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 56,
  },
  containerCompact: {
    paddingVertical: 16,
  },
  leftContent: {
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pictureContainer: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    overflow: 'hidden',
    backgroundColor: colors.backgroundContentAttention,
  },
  picture: {
    width: 44,
    height: 44,
  },
  title: {
    flexGrow: 1,
    flexShrink: 1,
  },
  titleText: {
    flexShrink: 1,
  },
  titleTextContainer: {
    flexDirection: 'row',
  },
  labelText: {
    marginLeft: 4,
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  valueText: {
    textAlign: 'right',
    flexShrink: 1,
  },
  subvalueText: {
    color: colors.textSecondary,
    textAlign: 'right',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}));
