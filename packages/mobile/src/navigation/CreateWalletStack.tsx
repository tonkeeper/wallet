import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SetupPasscodeScreen } from '../screens/Setup/SetupPasscodeScreen';
import { useTheme } from '$hooks/useTheme';
import { memo, useEffect } from 'react';
import { Screen } from '@tonkeeper/uikit';
import { useDispatch } from 'react-redux';
import { walletActions } from '$store/wallet';
import { useNavigation } from '@tonkeeper/router';
import { getPermission } from '$utils/messaging';
import { SetupNotificationsScreen } from '../screens/Setup/SetupNotificationsScreen';

const Stack = createNativeStackNavigator<any>();

export const CreateWalletStack = memo(() => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="/create/passcode"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        contentStyle: {
          backgroundColor: theme.colors.backgroundPrimary,
        },
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name="/create/passcode" component={Step1} />
      <Stack.Screen name="/create/notifications" component={Step2} />
    </Stack.Navigator>
  );
});

const Step1 = () => {
  const dispatch = useDispatch();
  const nav = useNavigation();

  useEffect(() => {
    dispatch(walletActions.generateVault());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen>
      <Screen.Header />
      <SetupPasscodeScreen
        onNext={async (passcode) => {
          const createWallet = (onDone: () => void) => {
            dispatch(
              walletActions.createWallet({
                pin: passcode,
                onDone: onDone,
                onFail: () => {},
              }),
            );
          };

          const hasNotificationPermission = await getPermission();
          if (hasNotificationPermission) {
            createWallet(() => {
              nav.replace('Tabs');
            });
          } else {
            nav.navigate('/create/notifications', { onNext: createWallet });
          }
        }}
      />
    </Screen>
  );
};

const Step2 = () => {
  const nav = useNavigation();

  return (
    <SetupNotificationsScreen
      onEnable={() => nav.replace('Tabs')}
      onSkip={() => nav.replace('Tabs')}
    />
  );
};
