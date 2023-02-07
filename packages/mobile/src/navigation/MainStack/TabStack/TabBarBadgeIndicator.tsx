import { useTheme } from '$hooks';
import { useNotificationsBadge } from '$hooks/useNotificationsBadge';
import { useShouldEnableNotifications } from '$hooks/useShouldEnableNotifications';
import { getCurrentRoute } from '$navigation/helper';
import { SettingsStackRouteNames } from '$navigation/navigationNames';
import { ns } from '$utils';
import React from 'react';
import { View } from 'react-native';

export const TabBarBadgeIndicator = () => {
  const theme = useTheme();
  const notificationsBadge = useNotificationsBadge();
  const route = getCurrentRoute();

  if (
    notificationsBadge.isVisible && 
    route.name !== SettingsStackRouteNames.Notifications
  ) {
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
}