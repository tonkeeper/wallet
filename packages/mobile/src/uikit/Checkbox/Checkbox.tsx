import React from 'react';
import { Icon } from '../Icon/Icon';
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
export interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  /*
    Used to change opacity when user press on ListItem
   */
  isPressedListItem?: SharedValue<boolean>;
}

const TouchableComponent =
  Platform.OS === 'android' ? NTouchableOpacity : TouchableOpacity;

const STouchableOpacity = Steezy.withStyle(TouchableComponent);

const Checkbox: React.FC<CheckboxProps> = (props) => {
  const { checked, onChange } = props;
  const colorProgress = useSharedValue(checked ? 1 : 0);
  const { colors } = useTheme();

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
        [colors.backgroundTertiary, 'transparent'],
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

  useEffect(() => {
    colorProgress.value = withTiming(checked ? 1 : 0, {
      duration: 200,
    });
  }, [checked, colorProgress]);

  return (
    <STouchableOpacity onPress={onChange} activeOpacity={0.6}>
      <Animated.View style={[styles.checkbox.static, opacityStyle, animatedStyle]}>
        <Animated.View style={iconStyle}>
          <Icon name="ic-done-bold-16" color="foregroundPrimary" />
        </Animated.View>
      </Animated.View>
    </STouchableOpacity>
  );
};

export default Checkbox;

const styles = Steezy.create(({ colors }) => ({
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderColor: colors.backgroundContentTint,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.buttonPrimaryBackground,
    borderColor: 'transparent',
  },
}));
