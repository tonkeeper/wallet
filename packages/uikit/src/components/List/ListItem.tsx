import Animated, { useSharedValue } from 'react-native-reanimated';
import { TouchableHighlight } from 'react-native-gesture-handler';
import React, { memo, useCallback } from 'react';
import FastImage from 'react-native-fast-image';
import { Steezy, StyleProp, useTheme } from '../../styles';
import { useRouter } from '@tonkeeper/router';
import { TextStyle } from 'react-native';
import { Pressable } from '../Pressable';
import { isAndroid } from '../../utils';
import { SText } from '../Text';
import { Icon } from '../Icon';
import { View } from '../View';

type LeftContentFN = (isPressed: Animated.SharedValue<boolean>) => React.ReactNode;

interface ListItemProps {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  value?: string | React.ReactNode;
  subvalue?: string | React.ReactNode;
  label?: string | React.ReactNode;
  valueStyle?: StyleProp<TextStyle>;
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
          <View style={styles.titleSTextContainer}>
            {typeof props.title === 'string' ? (
              <SText
                style={styles.titleSText.static}
                type="label1"
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
                style={styles.labelSText.static}
                color="textTertiary"
                numberOfLines={1}
                type="label1"
              >
                {props.label}
              </SText>
            ) : (
              props.label
            )}
          </View>

          {typeof props.subtitle === 'string' ? (
            <SText
              numberOfLines={subtitleNumberOfLines}
              color="textSecondary"
              type="body2"
            >
              {props.subtitle}
            </SText>
          ) : (
            props.subtitle
          )}
        </View>
        <View style={styles.valueContainer}>
          {typeof props.value === 'string' ? (
            <SText type="label1" style={[styles.valueSText.static, props.valueStyle]}>
              {`  ${props.value}`}
            </SText>
          ) : (
            props.value
          )}

          {typeof props.subvalue === 'string' ? (
            <SText type="body2" color="textSecondary">
              {props.subvalue}
            </SText>
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
  titleSText: {
    flexShrink: 1,
  },
  titleSTextContainer: {
    flexDirection: 'row',
  },
  labelSText: {
    marginLeft: 4,
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  valueSText: {
    textAlign: 'right',
    flexShrink: 1,
  },
  subvalueSText: {
    color: colors.textSecondary,
    textAlign: 'right',
  },
}));

const pictureCorners = {
  small: styles.pictureSmallCorner,
  full: styles.pictureFullCorner,
};
