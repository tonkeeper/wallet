import React, { FC } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '$hooks/useTheme';
import { ActivityStackRouteNames } from '$navigation';
import { ActivityStackParamList } from '$navigation/ActivityStack/ActivityStack.interface';
import { ActivityScreen } from '../../tabs/Activity/ActivityScreen';
import { NotificationsActivity } from '$core/Notifications/NotificationsActivity';
import { Notifications } from '$core/Notifications/Notifications';

const Stack = createNativeStackNavigator<ActivityStackParamList>();

export const ActivityStack: FC = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={ActivityStackRouteNames.Activity}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        contentStyle: {
          backgroundColor: theme.colors.backgroundPrimary,
        },
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name={ActivityStackRouteNames.Activity} component={ActivityScreen} />
      <Stack.Screen
        name={ActivityStackRouteNames.NotificationsActivity}
        component={NotificationsActivity}
      />
      <Stack.Screen
        name={ActivityStackRouteNames.Notifications}
        component={Notifications}
      />
    </Stack.Navigator>
  );
};
