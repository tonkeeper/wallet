import React from 'react';
import { Steezy } from '$styles';
import Animated, {
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '$hooks/useTheme';
import { useEffect } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Platform, TouchableOpacity as NTouchableOpacity } from 'react-native';
import { Icon } from '@tonkeeper/uikit';

export interface CheckboxViewProps {
  checked: boolean;
  /*
  Used to change opacity when user press on ListItem
 */
  isPressedListItem?: SharedValue<boolean>;
}

export interface CheckboxProps extends CheckboxViewProps {
  onChange: () => void;
  disabled?: boolean;
}

export const CheckboxView: React.FC<CheckboxViewProps> = (props) => {
  const { colors } = useTheme();

  const colorProgress = useSharedValue(props.checked ? 1 : 0);

  useEffect(() => {
    colorProgress.value = withTiming(props.checked ? 1 : 0, {
      duration: 200,
    });
  }, [props.checked, colorProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        colorProgress.value,
        [0, 1],
        ['transparent', colors.accentPrimary],
      ),
      borderColor: interpolateColor(
        colorProgress.value,
        [0, 1],
        [colors.iconTertiary, 'transparent'],
      ),
    };
  });

  const opacityStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(props.isPressedListItem?.value ? 0.6 : 1, {
        duration: 50,
      }),
    };
  }, [props.isPressedListItem]);

  const iconStyle = useAnimatedStyle(() => {
    return {
      opacity: colorProgress.value,
    };
  });

  return (
    <Animated.View style={[styles.checkbox.static, opacityStyle, animatedStyle]}>
      <Animated.View style={iconStyle}>
        <Icon name="ic-done-bold-16" color="buttonPrimaryForeground" />
      </Animated.View>
    </Animated.View>
  );
};

const TouchableComponent =
  Platform.OS === 'android' ? NTouchableOpacity : TouchableOpacity;

// @ts-ignore
const STouchableOpacity = Steezy.withStyle(TouchableComponent);

const Checkbox: React.FC<CheckboxProps> = (props) => {
  const { onChange, disabled, ...passProps } = props;

  return (
    <STouchableOpacity disabled={disabled} onPress={onChange} activeOpacity={0.6}>
      <CheckboxView {...passProps} />
    </STouchableOpacity>
  );
};

export default Checkbox;

const styles = Steezy.create(({ colors }) => ({
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderColor: colors.iconTertiary,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3,
  },
}));
