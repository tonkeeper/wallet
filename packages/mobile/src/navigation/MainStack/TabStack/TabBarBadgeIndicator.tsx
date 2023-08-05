import { useTheme } from '$hooks/useTheme';
import { ns } from '$utils';
import React from 'react';
import { View } from 'react-native';

export const TabBarBadgeIndicator: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const theme = useTheme();
  if (isVisible) {
    return (
      <View
        style={{
          position: 'absolute',
          top: -ns(1),
          right: -ns(6),
          width: ns(6),
          height: ns(6),
          borderRadius: ns(3),
          backgroundColor: theme.colors.accentNegative,
        }}
      />
    );
  }

  return null;
};
