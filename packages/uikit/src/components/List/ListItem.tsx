import Animated, { useSharedValue } from 'react-native-reanimated';
import { TouchableHighlight } from 'react-native-gesture-handler';
import React, { memo, useCallback } from 'react';
import FastImage from 'react-native-fast-image';
import { Steezy, useTheme } from '../../styles';
import { useRouter } from '@tonkeeper/router';
import { TextStyle } from 'react-native';
import { Pressable } from '../Pressable';
import { isAndroid } from '../../utils';
import { Icon } from '../Icon';
import { View } from '../View';
import { Text } from '../Text';

type LeftContentFN = (isPressed: Animated.SharedValue<boolean>) => React.ReactNode;

interface ListItemProps {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  value?: string | React.ReactNode;
  subvalue?: string | React.ReactNode;
  label?: string | React.ReactNode;
  valueStyle?: TextStyle;
  picture?: string;
  pictureCorner?: 'full' | 'small';
  chevron?: boolean;
  leftContent?: LeftContentFN | React.ReactNode;
  navigate?: string;
  subtitleNumberOfLines?: number;
  onPress?: () => void;
}

export const ListItem = memo<ListItemProps>((props) => {
  const { onPress, navigate, pictureCorner = 'full', subtitleNumberOfLines = 1 } = props;
  const isPressed = useSharedValue(false);
  const router = useRouter();
  const theme = useTheme();

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

  const handlePress = useCallback(() => {
    if (navigate) {
      router.navigate(navigate);
    } else {
      onPress?.();
    }
  }, [onPress, navigate]);

  const hasLeftContent = !!leftContent || !!props.picture;
  const pictureSource = { uri: props.picture };

  const TouchableComponent = isAndroid ? Pressable : TouchableHighlight;

  return (
    <TouchableComponent
      underlayColor={theme.backgroundContentTint}
      onPressOut={handlePressOut}
      onPressIn={handlePressIn}
      onPress={handlePress}
      disabled={!onPress && !navigate}
    >
      <View style={styles.container.static}>
        {hasLeftContent && (
          <View style={styles.leftContent}>
            {leftContent}
            {!!props.picture && (
              <View
                style={[styles.pictureContainer, pictureCorners[pictureCorner].static]}
              >
                <FastImage style={styles.picture.static} source={pictureSource} />
              </View>
            )}
          </View>
        )}
        <View style={styles.title}>
          <View style={styles.titleTextContainer}>
            {typeof props.title === 'string' ? (
              <Text
                style={styles.titleText.static}
                type="label1"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {props.title}
              </Text>
            ) : (
              props.title
            )}
            {typeof props.label === 'string' ? (
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

          {typeof props.subtitle === 'string' ? (
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
        <View style={styles.valueContainer}>
          {typeof props.value === 'string' ? (
            <Text type="label1" style={[styles.valueText.static, props.valueStyle]}>
              {`  ${props.value}`}
            </Text>
          ) : (
            props.value
          )}

          {typeof props.subvalue === 'string' ? (
            <Text type="body2" color="textSecondary">
              {props.subvalue}
            </Text>
          ) : (
            props.subvalue
          )}

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

const pictureCorners = {
  small: styles.pictureSmallCorner,
  full: styles.pictureFullCorner,
};
