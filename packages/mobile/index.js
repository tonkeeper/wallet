import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import './global';
import 'react-native-console-time-polyfill';
import 'text-encoding-polyfill';

import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { AppRegistry, LogBox } from 'react-native';
import {
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler';

import { App } from '$core/App';
import { name as appName } from './app.json';
import { debugLog } from './src/utils';
import { mainActions } from './src/store/main';
import { store, useNotificationsStore } from './src/store';
import { getAttachScreenFromStorage } from '$navigation/AttachScreen';
import crashlytics from '@react-native-firebase/crashlytics';
import messaging from '@react-native-firebase/messaging';
import { delay } from 'redux-saga/effects';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  "ViewPropTypes will be removed from React Native. Migrate to ViewPropTypes exported from 'deprecated-react-native-prop-types'.",
]);

if (__DEV__) {
  getAttachScreenFromStorage();
}

async function handleDappMessage(remoteMessage) {
  // handle data-only messages
  if (remoteMessage.notification?.body) {
    return null;
  }
  if (
    !['bridge_dapp_notification', 'console_dapp_notification'].includes(
      remoteMessage.data?.type,
    )
  ) {
    return null;
  }

  await useNotificationsStore.persist.rehydrate();
  useNotificationsStore.getState().actions.addNotification({
    ...remoteMessage.data,
    received_at: parseInt(remoteMessage.data.sent_at) || Date.now(),
  });
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

store.dispatch(mainActions.init());

function HeadlessCheck({ isHeadless }) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App />;
}

AppRegistry.registerComponent(appName, () => gestureHandlerRootHOC(HeadlessCheck));
