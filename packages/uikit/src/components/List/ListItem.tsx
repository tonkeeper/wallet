import Animated, { useSharedValue } from 'react-native-reanimated';
import { TouchableHighlight } from 'react-native-gesture-handler';
import React, { memo, useCallback } from 'react';
import FastImage from 'react-native-fast-image';
import { Steezy, StyleProp, useTheme } from '../../styles';
import { useRouter } from '@tonkeeper/router';
import { TextStyle, ViewStyle } from 'react-native';
import { Pressable } from '../Pressable';
import { isAndroid } from '../../utils';
import { SText as Text } from '../Text';
import { Icon } from '../Icon';
import { View } from '../View';

interface ListItemProps {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  value?: string | React.ReactNode;
  subvalue?: string | React.ReactNode;
  label?: string | React.ReactNode;
  valueStyle?: StyleProp<TextStyle>;
  picture?: string;
  pictureStyle?: StyleProp<ViewStyle>;
  pictureCorner?: 'full' | 'small';
  chevron?: boolean;
  leftContent?: React.ReactNode;
  navigate?: string;
  subtitleNumberOfLines?: number;
  content?: React.ReactNode;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
}

function isString<T>(str: T) {
  return typeof str === 'string';
}

export const ListItem = memo<ListItemProps>((props) => {
  const {
    onPress,
    onPressIn,
    onPressOut,
    navigate,
    pictureCorner = 'full',
    subtitleNumberOfLines = 1,
  } = props;
  const router = useRouter();
  const theme = useTheme();

  const handlePress = useCallback(() => {
    if (navigate) {
      router.navigate(navigate);
    } else {
      onPress?.();
    }
  }, [onPress, navigate]);

  const hasLeftContent = !!props.leftContent || !!props.picture;
  const pictureSource = { uri: props.picture };

  const TouchableComponent = isAndroid ? Pressable : TouchableHighlight;

  return (
    <TouchableComponent
      underlayColor={theme.backgroundContentTint}
      disabled={!onPress && !navigate}
      onPressOut={onPressOut}
      onPressIn={onPressIn}
      onPress={handlePress}
    >
      <View style={styles.container.static}>
        {hasLeftContent && (
          <View style={styles.leftContent}>
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
            <View style={styles.titleContainer}>
              <View style={styles.titleWithLable}>
                {isString(props.title) ? (
                  <Text
                    style={styles.titleText}
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    type="label1"
                  >
                    {props.title}
                  </Text>
                ) : (
                  props.title
                )}
                {isString(props.label) ? (
                  <Text
                    style={styles.labelText.static}
                    color="textTertiary"
                    numberOfLines={1}
                    type="label1"
                  >
                    {props.label}
                  </Text>
                ) : (
                  props.label
                )}
              </View>
            </View>
            {isString(props.value) ? (
              <Text type="label1" style={props.valueStyle}>
                {`  ${props.value}`}
              </Text>
            ) : (
              props.value
            )}
          </View>
          <View style={styles.bottomLine}>
            <View style={styles.subtitleContainer}>
              {isString(props.subtitle) ? (
                <Text
                  numberOfLines={subtitleNumberOfLines}
                  color="textSecondary"
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
                {props.subvalue}
              </Text>
            ) : (
              props.subvalue
            )}
          </View>
          {props.content}
          {props.chevron && <Icon name="ic-chevron-right-16" color="iconPrimary" />}
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
    flexGrow: 1,
    flexShrink: 1,
  },
  subtitleContainer: {
    flex: 1,
  },
  titleWithLable: {
    flexDirection: 'row',
  },
  titleText: {
    flexShrink: 1,
  },
  labelText: {
    marginLeft: 4,
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
