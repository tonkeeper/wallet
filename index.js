import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import './global';
import 'react-native-console-time-polyfill';
import 'text-encoding-polyfill';

import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import {
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler';

import { App } from '$core/App';
import { name as appName } from './app.json';
import { debugLog } from './src/utils';
import { mainActions } from './src/store/main';
import { store } from './src/store';
import { getAttachScreenFromStorage } from '$navigation/AttachScreen';
import crashlytics from '@react-native-firebase/crashlytics';

if (__DEV__) {
  getAttachScreenFromStorage();
}

setJSExceptionHandler((error, isFatal) => {
  crashlytics().recordError(error, error.toString());
  debugLog('JsError', error.toString(), isFatal);
}, true);

setNativeExceptionHandler((exceptionString) => {
  debugLog('NativeError', exceptionString);
});

store.dispatch(mainActions.init());

AppRegistry.registerComponent(appName, () => gestureHandlerRootHOC(App));
