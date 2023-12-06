import { SetupNotificationsScreen } from '../screens/Setup/SetupNotificationsScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SetupPasscodeScreen } from '../screens/Setup/SetupPasscodeScreen';
import { useTheme } from '$hooks/useTheme';
import { memo, useState } from 'react';
import { Screen } from '@tonkeeper/uikit';
import { useDispatch } from 'react-redux';
import { walletActions } from '$store/wallet';
import { useNavigation } from '@tonkeeper/router';
import { getPermission } from '$utils/messaging';
import { SetupRecoveryPhrasePage } from '@tonkeeper/shared/screens/setup/pages/SetupRecoveryPhrasePage';
import { tk } from '@tonkeeper/shared/tonkeeper';

const Stack = createNativeStackNavigator<any>();

export const ImportWalletStack = memo(() => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="/import/phrase"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        contentStyle: {
          backgroundColor: theme.colors.backgroundPrimary,
        },
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name="/import/phrase" component={Step1} />
      <Stack.Screen name="/import/passcode" component={Step2} />
      <Stack.Screen name="/import/notifications" component={Step3} />
    </Stack.Navigator>
  );
});

const Step1 = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const nav = useNavigation();

  return (
    <Screen>
      <Screen.Header />
      <SetupRecoveryPhrasePage
        loading={loading}
        onNext={(phrase, config) => {
          setLoading(true);
          dispatch(
            walletActions.restoreWallet({
              mnemonics: phrase,
              config,
              onDone: () => {
                setLoading(false);
                nav.navigate('/import/passcode');
              },
              onFail: () => {
                setLoading(false);
              },
            }),
          );
        }}
      />
    </Screen>
  );
};

const Step2 = () => {
  const dispatch = useDispatch();
  const nav = useNavigation();

  return (
    <Screen>
      <Screen.Header />
      <SetupPasscodeScreen
        onNext={(passscode) => {
          dispatch(
            walletActions.createWallet({
              pin: passscode,
              onDone: async () => {
                const hasNotificationPermission = await getPermission();
                if (hasNotificationPermission) {
                  nav.replace('Tabs');
                } else {
                  nav.replace('/import/notifications');
                }
                tk.wallet?.saveLastBackupTimestamp();
              },
              onFail: () => {},
            }),
          );
        }}
      />
    </Screen>
  );
};

const Step3 = () => {
  const nav = useNavigation();

  return (
    <SetupNotificationsScreen
      onEnable={() => nav.replace('Tabs')}
      onSkip={() => nav.replace('Tabs')}
    />
  );
};
