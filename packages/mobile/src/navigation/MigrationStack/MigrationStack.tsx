import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '$hooks/useTheme';
import { memo } from 'react';
import { AddWatchOnly } from '$core';
import { MigrationStackParamList, MigrationStackRouteNames } from './types';
import { ChooseWallets } from '../../screens';

const Stack = createNativeStackNavigator<MigrationStackParamList>();

export const MigrationStack = memo(() => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={MigrationStackRouteNames.Passcode}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        contentStyle: {
          backgroundColor: theme.colors.backgroundPrimary,
        },
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name={MigrationStackRouteNames.Passcode} component={AddWatchOnly} />
      <Stack.Screen
        name={MigrationStackRouteNames.ChooseWallets}
        component={ChooseWallets}
      />
    </Stack.Navigator>
  );
});
