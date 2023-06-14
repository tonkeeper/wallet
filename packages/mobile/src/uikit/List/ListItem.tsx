import React, { memo, useCallback } from 'react';
import { TextStyle, ViewStyle } from 'react-native';
import { Steezy, StyleProp } from '$styles';
import { View, SText, Icon, Pressable } from '$uikit';
import { DarkTheme, TonThemeColor } from '$styled';
import FastImage from 'react-native-fast-image';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { isAndroid } from '$utils';

type LeftContentFN = (isPressed: Animated.SharedValue<boolean>) => React.ReactNode;

export interface ListItemProps {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  value?: string | React.ReactNode;
  subvalue?: string | React.ReactNode;
  label?: string | React.ReactNode;
  chevronColor?: TonThemeColor;
  imageStyle?: StyleProp<ViewStyle>;
  compact?: boolean;
  isLast?: boolean;
  isFirst?: boolean;

  valueStyle?: StyleProp<TextStyle>;

  picture?: string;

  chevron?: boolean;

  leftContent?: LeftContentFN | React.ReactNode;
  rightContent?: () => React.ReactNode;

  onPress?: () => void;
}

export const ListItem = memo<ListItemProps>((props) => {
  const isPressed = useSharedValue(false);
  const { compact = true } = props;

  const handlePressIn = useCallback(() => {
    isPressed.value = true;
  }, []);

  const handlePressOut = useCallback(() => {
    isPressed.value = false;
  }, []);

  const leftContent = React.useMemo(() => {
    if (typeof props.leftContent === 'function') {
      return props.leftContent(isPressed);
    }

    return props.leftContent;
  }, [props.leftContent]);

  const hasLeftContent = !!leftContent || !!props.picture;
  const pictureSource = { uri: props.picture };

  const TouchableComponent = isAndroid ? Pressable : TouchableHighlight;
  const renderTitle = useCallback(() => {
    return (
      <View style={styles.title}>
        <View style={styles.titleTextContainer}>
          {typeof props.title === 'string' ? (
            <SText
              style={styles.titleText}
              variant={compact ? 'label1' : 'body2'}
              color={compact ? 'textPrimary' : 'textSecondary'}
              numberOfLines={1}
              ellipsizeMode="tail"
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
  }, [props.title, compact, props.label, props.subtitle]);

  return (
    <TouchableComponent
      underlayColor={DarkTheme.colors.backgroundHighlighted}
      onPressOut={handlePressOut}
      onPressIn={handlePressIn}
      onPress={props.onPress}
      disabled={!props.onPress}
    >
      <View style={[styles.container.static, compact && styles.containerCompact.static]}>
        {hasLeftContent && (
          <View style={styles.leftContent}>
            {leftContent}
            {!!props.picture && (
              <View style={[styles.pictureContainer, props.imageStyle]}>
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

          {props.chevron && (
            <Icon color={props.chevronColor} name="ic-chevron-right-16" />
          )}
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
    backgroundColor: colors.backgroundContentTint,
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
}));
