import React from 'react';
import { Dimensions } from 'react-native';
import { Steezy } from '../../styles';
import { Text } from '../Text';
import { TouchableOpacity } from '../TouchableOpacity';
import { Icon, IconNames } from '../Icon';

export interface ActionButtonProps {
  title: string;
  icon: IconNames;
  onPress?: () => void;
  disabled?: boolean;
  inRow?: number;
}

const containerWidth = Dimensions.get('window').width - 32;
export const ActionButton = ({
  title,
  icon,
  onPress,
  disabled,
  inRow = 3,
}: ActionButtonProps) => {
  const width = containerWidth / inRow;
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.actionButton.static,
        disabled && styles.actionButtonDisabled.static,
        { width },
      ]}
    >
      <Icon name={icon} />
      <Text color="textSecondary" type={'label3'}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = Steezy.create({
  actionButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
});
