import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '$hooks/useTheme';
import { memo } from 'react';
import { AddWatchOnlyStackParamList, AddWatchOnlyStackRouteNames } from './types';
import { AddWatchOnly } from '$core';
import { SetupNotifications } from '$core/SetupNotifications/SetupNotifications';

const Stack = createNativeStackNavigator<AddWatchOnlyStackParamList>();

export const AddWatchOnlyStack = memo(() => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={AddWatchOnlyStackRouteNames.AddWatchOnly}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        contentStyle: {
          backgroundColor: theme.colors.backgroundPrimary,
        },
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen
        name={AddWatchOnlyStackRouteNames.AddWatchOnly}
        component={AddWatchOnly}
      />
      <Stack.Screen
        name={AddWatchOnlyStackRouteNames.Notifications}
        component={SetupNotifications}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
});
