import React from 'react';
import { Icon, TouchableOpacity } from '$uikit';
import { Steezy } from '$styles';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '$hooks';
import { useEffect } from 'react';
export interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

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
    <TouchableOpacity onPress={onChange} activeOpacity={0.6}>
      <Animated.View style={[styles.checkbox.static, animatedStyle]}>
        <Animated.View style={iconStyle}>
          <Icon name="ic-done-bold-16" color="foregroundPrimary" />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
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
