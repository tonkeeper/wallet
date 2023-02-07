import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppStackParamList } from '$navigation/AppStack/AppStack.interface';
import { AppStackRouteNames } from '$navigation';
import { MainStack } from '$navigation/MainStack';
import {
  Intro,
  ModalContainer,
  AccessConfirmation,
} from '$core';
import { useTheme } from '$hooks';
import { mainSelector } from '$store/main';
import { isAndroid } from '$utils';
import { walletWalletSelector } from '$store/wallet';
import { useAttachScreen } from '$navigation/AttachScreen';
import { useNotificationsResolver } from '$hooks/useNotificationsResolver';
import { withModalStack } from '$libs/navigation';
import { ModalStack } from '$navigation/ModalStack';
import { ProvidersWithNavigation } from '$navigation/Providers';

const Stack = createNativeStackNavigator<AppStackParamList>();

// DEPRECATED; TODO: move to new modals
export const AppStackComponent: FC = () => {
  const theme = useTheme();
  const { isIntroShown, isUnlocked } = useSelector(mainSelector);
  const wallet = useSelector(walletWalletSelector);
  const attachedScreen = useAttachScreen();
  useNotificationsResolver();

  function renderRoot() {
    if (isIntroShown) {
      return (
        <Stack.Screen
          name={AppStackRouteNames.Intro}
          component={Intro}
          options={{
            contentStyle: { backgroundColor: theme.colors.backgroundPrimary },
          }}
        />
      );
    } else if (!isUnlocked && wallet && !attachedScreen.pathname) {
      return (
        <Stack.Screen
          name={AppStackRouteNames.MainAccessConfirmation}
          component={AccessConfirmation}
        />
      );
    } else {
      return <Stack.Screen name={AppStackRouteNames.MainStack} component={MainStack} />;
    }
  }

  return (
    <ProvidersWithNavigation>
      <Stack.Navigator
        screenOptions={{
          presentation: 'modal',
          headerShown: false,
          gestureEnabled: true,
          animation: isAndroid ? 'default' : 'slide_from_right',
          contentStyle: {
            backgroundColor: theme.colors.backgroundPrimary,
          },
        }}
      >
        {renderRoot()}
      </Stack.Navigator>
    </ProvidersWithNavigation>
  );
};

export const AppStack = withModalStack({ 
  RootStack: AppStackComponent,
  ModalStack: ModalStack,
})