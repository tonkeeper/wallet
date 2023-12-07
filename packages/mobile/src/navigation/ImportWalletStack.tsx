import { SetupNotificationsScreen } from '../screens/Setup/SetupNotificationsScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SetupPasscodeScreen } from '../screens/Setup/SetupPasscodeScreen';
import { useTheme } from '$hooks/useTheme';
import { memo, useCallback } from 'react';
import { Screen } from '@tonkeeper/uikit';
import { useDispatch } from 'react-redux';
import { walletActions } from '$store/wallet';
import { useNavigation } from '@tonkeeper/router';
import { getPermission } from '$utils/messaging';
import { SetupRecoveryPhrasePage } from '@tonkeeper/shared/screens/setup/pages/SetupRecoveryPhrasePage';
import { tk } from '@tonkeeper/shared/tonkeeper';
import { useParams } from '@tonkeeper/router/src/imperative';
import { debugLog } from '$utils/debugLog';

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
  const nav = useNavigation();

  return (
    <Screen>
      <Screen.Header gradient />
      <SetupRecoveryPhrasePage
        onNext={(phrase, config) => {
          nav.navigate('/import/passcode', { phrase, config });
        }}
      />
    </Screen>
  );
};

type ResoreParams = {
  onFail: () => void;
  onDone: () => void;
  passscode: string;
  phrase: string;
  config?: string;
};

const useRestoreWallet = () => {
  const dispatch = useDispatch();

  return useCallback(
    (params: ResoreParams) => {
      dispatch(
        walletActions.restoreWallet({
          mnemonics: params.phrase,
          config: params.config,
          onDone: () => {
            dispatch(
              walletActions.createWallet({
                pin: params.passscode,
                onDone: params.onDone,
                onFail: params.onFail,
              }),
            );
          },
          onFail: params.onFail,
        }),
      );
    },
    [dispatch],
  );
};

const Step2 = () => {
  const params = useParams<{ phrase: string; config?: string }>();
  const restore = useRestoreWallet();
  const nav = useNavigation();

  return (
    <Screen>
      <Screen.Header />
      <SetupPasscodeScreen
        onNext={async (passscode) => {
          const goRestore = (onDone: () => void) => {
            restore({
              passscode,
              phrase: params.phrase,
              config: params.config,
              onDone: () => {
                tk.wallet?.saveLastBackupTimestamp();
                onDone();
              },
              onFail: () => {
                debugLog('Error import wallet');
              },
            });
          };

          const hasNotificationPermission = await getPermission();
          if (hasNotificationPermission) {
            goRestore(() => {
              nav.replace('Tabs');
            });
          } else {
            nav.navigate('/import/notifications', { onNext: goRestore });
          }
        }}
      />
    </Screen>
  );
};

const Step3 = () => {
  return <SetupNotificationsScreen />;
};
