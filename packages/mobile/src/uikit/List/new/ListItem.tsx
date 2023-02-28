import React, { memo, useCallback } from 'react';
import { Steezy, StyleProp } from '$styles';
import { TouchableHighlight, View, SText } from '$uikit';
import { DarkTheme } from '$styled';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { TextStyle } from 'react-native';

interface ListItemProps {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  value?: string | React.ReactNode;
  subvalue?: string | React.ReactNode;

  valueStyle?: StyleProp<TextStyle>;

  leftContent?: (isPressed: Animated.SharedValue<boolean>) => React.ReactNode;
  rightContent?: () => React.ReactNode;

  onPress?: () => void;
}

export const ListItem = memo<ListItemProps>((props) => {
  const isPressed = useSharedValue(false);

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

  return (
    <TouchableHighlight 
      underlayColor={DarkTheme.colors.backgroundTertiary}
      onPressOut={handlePressOut}
      onPressIn={handlePressIn}
      onPress={props.onPress}
    >
      <View style={styles.container}>
        {leftContent && (
          <View style={styles.leftContent}>
            {leftContent}
          </View>
        )}
        <View style={styles.title}>
          {typeof props.title === 'string' ? (
            <SText variant="label1" numberOfLines={1}>
              {props.title}
            </SText>
          ) : props.title}

          {typeof props.subtitle === 'string' ? (
            <SText 
              variant="body2" 
              style={styles.subtitleText}
              numberOfLines={1}
            >
              {props.subtitle}
            </SText>
          ) : props.subtitle}
        </View>
        <View style={styles.valueContainer}>
          {typeof props.value === 'string' ? (
            <SText variant="label1" style={[styles.valueText, props.valueStyle]}>
              {props.value}
            </SText>
          ) : props.value}

          {typeof props.subvalue === 'string' ? (
            <SText variant="body2" style={styles.subtitleText}>
              {props.subvalue}
            </SText>
          ) : props.subvalue}
        </View>
      </View>
    </TouchableHighlight>
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
  },
  title: {
    flex: 1,
    paddingRight: 16,
  },
  valueContainer: {
    alignItems: 'flex-end'
  },
  subtitleText: {
    color: colors.textSecondary,
  },
  valueText: {
    textAlign: 'right',
  },
  subvalueText: {
    color: colors.textSecondary,
    textAlign: 'right',
  }
}));
