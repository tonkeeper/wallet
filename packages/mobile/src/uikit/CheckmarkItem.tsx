import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '$hooks/useTheme';
import { View } from 'react-native';
import { Icon } from './Icon/Icon';
import { Text } from './Text/Text';
import { ns } from '$utils';

interface RadioItemProps {
  label: string;
  onChange?: (value: boolean) => void;
  selected: boolean;
}

export const CheckmarkItem = React.memo<RadioItemProps>(
  ({ label, selected, onChange }) => (
    <TouchableOpacity onPress={() => onChange?.(!selected)} activeOpacity={0.6}>
      <View style={styles.checkmarkItem}>
        <Checkmark checked={selected} />
        <Text
          style={styles.checkmarkLabelText}
          color="foregroundSecondary"
          variant="body1"
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  ),
);

export const Checkmark = ({ checked }: { checked: boolean }) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.checkmarkContainer,
        {
          borderColor: checked ? theme.colors.accentPrimary : theme.colors.iconTertiary,
          backgroundColor: checked ? theme.colors.accentPrimary : 'transparent',
        },
      ]}
    >
      {checked && (
        <View style={styles.checkmark}>
          <Icon name="ic-done-bold-16" color="buttonPrimaryForeground" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  checkmarkContainer: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: ns(2),
  },
  checkmark: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 3,
  },
  checkmarkLabelText: {
    marginLeft: 11,
  },
});
