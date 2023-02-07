import React, { FC } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '$hooks';
import { SecurityMigrationStackRouteNames } from '$navigation';
import {
  AccessConfirmation,
  CreatePin,
  SecurityMigration,
  SetupBiometry,
  SetupWalletDone,
} from '$core';
import { SecurityMigrationStackParamList } from './SecurityMigrationStack.interface';

const Stack = createNativeStackNavigator<SecurityMigrationStackParamList>();

export const SecurityMigrationStack: FC = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={SecurityMigrationStackRouteNames.SecurityMigration}
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
        name={SecurityMigrationStackRouteNames.SecurityMigration}
        component={SecurityMigration}
      />
      <Stack.Screen
        name={SecurityMigrationStackRouteNames.AccessConfirmation}
        component={AccessConfirmation}
        options={{
          presentation: 'fullScreenModal',
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name={SecurityMigrationStackRouteNames.SetupBiometry}
        component={SetupBiometry}
      />
      <Stack.Screen
        name={SecurityMigrationStackRouteNames.SetupWalletDone}
        component={SetupWalletDone}
        options={{
          gestureEnabled: false,
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name={SecurityMigrationStackRouteNames.CreatePin}
        component={CreatePin}
      />
    </Stack.Navigator>
  );
};
