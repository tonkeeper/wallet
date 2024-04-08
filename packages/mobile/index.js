import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import './global';
import 'react-native-console-time-polyfill';
import 'text-encoding-polyfill';
import 'react-native-url-polyfill/auto';

import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { AppRegistry, LogBox } from 'react-native';
import {
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler';

import { App } from '$core/App';
import { name as appName } from './app.json';
import { debugLog } from './src/utils/debugLog';
import { useNotificationsStore } from './src/store';
import { getAttachScreenFromStorage } from '$navigation/AttachScreen';
import crashlytics from '@react-native-firebase/crashlytics';
import messaging from '@react-native-firebase/messaging';
import { withIAPContext } from 'react-native-iap';
import { startApp } from './src/index';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  "ViewPropTypes will be removed from React Native. Migrate to ViewPropTypes exported from 'deprecated-react-native-prop-types'.",
]);

if (__DEV__) {
  getAttachScreenFromStorage();
}

// TODO: should be address-specified store
async function handleDappMessage(remoteMessage) {
  // handle data-only messages
  if (remoteMessage.notification?.body) {
    return null;
  }

  if (
    !['console_dapp_notification', 'better_stake_option_found', 'collect_stake'].includes(
      remoteMessage.data?.type,
    )
  ) {
    return null;
  }
  await useNotificationsStore.persist.rehydrate();
  if (remoteMessage.data?.type === 'better_stake_option_found') {
    useNotificationsStore
      .getState()
      .actions.toggleRestakeBanner(
        remoteMessage.data.account,
        true,
        remoteMessage.data.stakingAddressToMigrateFrom,
      );
  }

  useNotificationsStore.getState().actions.addNotification(
    {
      ...remoteMessage.data,
      received_at: parseInt(remoteMessage.data.sent_at) || Date.now(),
    },
    remoteMessage.data.account,
  );
  await useNotificationsStore.persist.rehydrate();
  return;
}

messaging().setBackgroundMessageHandler(handleDappMessage);
messaging().onMessage(handleDappMessage);

setJSExceptionHandler((error, isFatal) => {
  crashlytics().recordError(error, error.toString());
  debugLog('JsError', error.toString(), isFatal);
}, true);

setNativeExceptionHandler((exceptionString) => {
  debugLog('NativeError', exceptionString);
});

startApp();

AppRegistry.registerComponent(appName, () => withIAPContext(gestureHandlerRootHOC(App)));
