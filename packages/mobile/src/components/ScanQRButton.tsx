import React, { memo } from 'react';
import { Icon, TouchableOpacity } from '$uikit';
import { Steezy } from '$styles';

interface ScanQRButtonProps {
  onPress: () => void;
}

export const ScanQRButton = memo<ScanQRButtonProps>(({ onPress }) => {
  const hitSlop = {
    top: 26,
    bottom: 26,
    left: 26,
    right: 26,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.6}
      hitSlop={hitSlop}
    >
      <Icon name="ic-viewfinder-28" color="accentPrimary" />
    </TouchableOpacity>
  );
});

const styles = Steezy.create({
  container: {
    zIndex: 3,
  }
});
