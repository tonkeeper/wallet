import { TouchableHighlight as TouchableGestureHighlight } from 'react-native-gesture-handler';
import { TextStyle, ViewStyle, TouchableHighlight } from 'react-native';
import { ListItemPressedContext } from './ListItemPressedContext';
import { Steezy, StyleProp, useTheme } from '../../styles';
import { useSharedValue } from 'react-native-reanimated';
import React, { memo, useCallback } from 'react';
import FastImage from 'react-native-fast-image';
import { useRouter } from '@tonkeeper/router';
import { Pressable } from '../Pressable';
import { isAndroid } from '../../utils';
import { SText as Text } from '../Text';
import { Icon } from '../Icon';
import { View } from '../View';

export interface ListItemProps {
  titleType?: 'primary' | 'secondary';
  title?: string | React.ReactNode;
  titleContainerStyle?: StyleProp<ViewStyle>;
  titleTextType?: TTextTypes;
  subtitle?: string | React.ReactNode;
  subtitleStyle?: StyleProp<TextStyle>;
  value?: string | React.ReactNode;
  subvalue?: string | React.ReactNode;
  valueStyle?: StyleProp<TextStyle>;
  valueContainerStyle?: StyleProp<ViewStyle>;
  picture?: string;
  pictureStyle?: StyleProp<ViewStyle>;
  pictureCorner?: 'full' | 'small';
  chevron?: boolean;
  chevronColor?: 'iconTertiary' | 'iconSecondary';
  leftContentStyle?: StyleProp<ViewStyle>;
  leftContent?: React.ReactNode;
  navigate?: string;
  titleNumberOfLines?: number;
  subtitleNumberOfLines?: number;
  gestureHandler?: boolean;
  children?: React.ReactNode;
  rightContent?: React.ReactNode;
  valueMultiline?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

function isString<T>(str: T) {
  return typeof str === 'string';
}

export const ListItem = memo<ListItemProps>((props) => {
  const {
    disabled,
    onPress,
    navigate,
    chevronColor = 'iconTertiary',
    pictureCorner = 'full',
    titleTextType,
    titleNumberOfLines = 1,
    subtitleNumberOfLines = 1,
    valueMultiline,
    titleType = 'primary',
    leftContentStyle,
    gestureHandler,
    rightContent,
    children,
  } = props;

  const router = useRouter();
  const theme = useTheme();

  const isPressed = useSharedValue(0);

  const handlePress = useCallback(() => {
    if (navigate) {
      router.navigate(navigate);
    } else {
      onPress?.();
    }
  }, [onPress, navigate]);

  const onPressIn = () => (isPressed.value = 1);
  const onPressOut = () => (isPressed.value = 0);

  const hasLeftContent = !!props.leftContent || !!props.picture;
  const pictureSource = { uri: props.picture };

  const TouchableComponent = isAndroid
    ? Pressable
    : gestureHandler
    ? TouchableGestureHighlight
    : TouchableHighlight;

  return (
    <TouchableComponent
      underlayColor={theme.backgroundContentTint}
      disabled={disabled || (!onPress && !navigate)}
      onPressOut={onPressOut}
      onPressIn={onPressIn}
      onPress={handlePress}
    >
      <ListItemPressedContext.Provider value={isPressed}>
        <View style={styles.container.static}>
          {hasLeftContent && (
            <View style={[styles.leftContent, leftContentStyle]}>
              {props.leftContent}
              {!!props.picture && (
                <View
                  style={[
                    styles.pictureContainer,
                    pictureCorners[pictureCorner].static,
                    props.pictureStyle,
                  ]}
                >
                  <FastImage style={styles.picture.static} source={pictureSource} />
                </View>
              )}
            </View>
          )}
          <View style={styles.lines}>
            <View style={styles.topLine}>
              <View style={[styles.titleContainer, props.titleContainerStyle]}>
                {isString(props.title) ? (
                  <Text
                    color={titleType === 'primary' ? 'textPrimary' : 'textSecondary'}
                    type={
                      titleTextType
                        ? titleTextType
                        : titleType === 'primary'
                        ? 'label1'
                        : 'body1'
                    }
                    color={titleType === 'primary' ? 'textPrimary' : 'textSecondary'}
                    numberOfLines={titleNumberOfLines}
                    ellipsizeMode="tail"
                  >
                    {props.title}
                  </Text>
                ) : (
                  props.title
                )}
              </View>
              <View style={[styles.valueContainer, props.valueContainerStyle]}>
                {isString(props.value) ? (
                  <Text
                    numberOfLines={!valueMultiline ? 1 : undefined}
                    style={props.valueStyle}
                    textAlign="right"
                    type="label1"
                  >
                    {`  ${props.value}`}
                  </Text>
                ) : (
                  props.value
                )}
              </View>
            </View>
            <View style={styles.bottomLine}>
              <View style={styles.subtitleContainer}>
                {isString(props.subtitle) ? (
                  <Text
                    style={props.subtitleStyle}
                    numberOfLines={subtitleNumberOfLines}
                    color={titleType === 'primary' ? 'textSecondary' : 'textTertiary'}
                    type="body2"
                  >
                    {props.subtitle}
                  </Text>
                ) : (
                  props.subtitle
                )}
              </View>
              {isString(props.subvalue) ? (
                <Text type="body2" color="textSecondary">
                  {` ${props.subvalue}`}
                </Text>
              ) : (
                props.subvalue
              )}
            </View>

            {children}
          </View>
          {rightContent}
          {props.chevron && <Icon name="ic-chevron-right-16" color={chevronColor} />}
        </View>
      </ListItemPressedContext.Provider>
    </TouchableComponent>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  leftContent: {
    paddingRight: 16,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  pictureContainer: {
    width: 44,
    height: 44,
    overflow: 'hidden',
    backgroundColor: colors.backgroundContentTint,
  },
  pictureFullCorner: {
    borderRadius: 44 / 2,
  },
  pictureSmallCorner: {
    borderRadius: 12,
  },
  picture: {
    width: 44,
    height: 44,
  },
  lines: {
    flex: 1,
  },
  topLine: {
    flexDirection: 'row',
  },
  bottomLine: {
    flexDirection: 'row',
  },
  titleContainer: {
    marginRight: 6,
  },
  subtitleContainer: {
    flex: 1,
  },
  titleWithLable: {
    flexDirection: 'row',
  },
  valueContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  subvalueText: {
    color: colors.textSecondary,
    textAlign: 'right',
  },
}));

const pictureCorners = {
  small: styles.pictureSmallCorner,
  full: styles.pictureFullCorner,
};
