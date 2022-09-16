import React, { FC } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '$hooks';
import { SettingsStackRouteNames } from '$navigation';
import {
  DevMenu,
  Logs,
  Security,
  SecurityMigration,
  Settings,
  LegalDocuments,
  FontLicense,
} from '$core';
import { SettingsStackParamList } from '$navigation/SettingsStack/SettingsStack.interface';
import { Notifications } from '$core/Notifications/Notifications';
import { JettonsList } from '$core/JettonsList/JettonsList';
import { ChooseCurrencyScreen } from '$core/ChooseCurrencyScreen';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsStack: FC = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={SettingsStackRouteNames.Settings}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        contentStyle: {
          backgroundColor: theme.colors.backgroundPrimary,
        },
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name={SettingsStackRouteNames.Settings} component={Settings} />
      <Stack.Screen name={SettingsStackRouteNames.DevMenu} component={DevMenu} />
      <Stack.Screen name={SettingsStackRouteNames.Logs} component={Logs} />
      <Stack.Screen name={SettingsStackRouteNames.Security} component={Security} />
      <Stack.Screen name={SettingsStackRouteNames.LegalDocuments} component={LegalDocuments} />
      <Stack.Screen name={SettingsStackRouteNames.FontLicense} component={FontLicense} />
      <Stack.Screen
        name={SettingsStackRouteNames.SecurityMigration}
        component={SecurityMigration}
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          contentStyle: {
            backgroundColor: theme.colors.backgroundPrimary,
          },
        }}
      />
      <Stack.Screen name={SettingsStackRouteNames.Notifications} component={Notifications} />
      <Stack.Screen name={SettingsStackRouteNames.JettonsList} component={JettonsList} />
      <Stack.Screen name={SettingsStackRouteNames.ChooseCurrency} component={ChooseCurrencyScreen} />
    </Stack.Navigator>
  );
};
