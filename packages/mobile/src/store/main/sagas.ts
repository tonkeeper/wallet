import { all, takeLatest, put, call, select } from 'redux-saga/effects';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import { i18n } from '$translation';
import { Platform } from 'react-native';

import { mainActions, mainSelector } from './index';
import { batchActions } from '$store';
import * as SplashScreen from 'expo-splash-screen';
import {
  getHiddenNotifications,
  getSavedLogs,
  hideNotification,
  setSavedLogs,
} from '$database';
import { HideNotificationAction } from '$store/main/interface';
import { withRetry } from '$store/retry';
import { InternalNotificationModel } from '$store/models';

import { initStats, trackEvent, trackFirstLaunch } from '$utils/stats';
import { favoritesActions } from '$store/favorites';
import { tk } from '$wallet';
import { config } from '$config';

SplashScreen.preventAutoHideAsync()
  .then((result) =>
    console.log(`SplashScreen.preventAutoHideAsync() succeeded: ${result}`),
  )
  .catch(console.warn); // it's good to explicitly catch and inspect any error

function* initWorker() {
  yield call(initHandler);
}

export function* initHandler() {
  initStats();

  trackFirstLaunch();
  trackEvent('launch_app');

  yield call([tk, 'init']);

  yield put(batchActions(mainActions.endInitiating()));

  const logs = yield call(getSavedLogs);
  yield put(mainActions.setLogs(logs));

  yield put(mainActions.loadNotifications());

  yield put(favoritesActions.loadSuggests());
  SplashScreen.hideAsync();
}

function* loadNotificationsWorker() {
  try {
    const data = yield withRetry(
      'loadNotificationsWorker',
      axios.get,
      `${config.get('tonkeeperEndpoint')}/notifications`,
      {
        params: {
          platform: Platform.OS,
          version: DeviceInfo.getVersion(),
          lang: i18n.locale,
        },
      },
    );

    const hidden = yield call(getHiddenNotifications);
    yield put(
      mainActions.setNotifications(
        data.data.notifications.filter(
          (item: InternalNotificationModel) => hidden.indexOf(item.id) === -1,
        ),
      ),
    );
  } catch (e) {}
}

function* hideNotificationWorker(action: HideNotificationAction) {
  try {
    if (action.payload.isPersistenceHide) {
      yield call(hideNotification, action.payload.id);
    }
  } catch (e) {}
}

function* addLogWorker() {
  try {
    const { logs } = yield select(mainSelector);
    yield call(setSavedLogs, logs);
  } catch (e) {}
}

export function* mainSaga() {
  yield all([
    takeLatest(mainActions.init, initWorker),
    takeLatest(mainActions.loadNotifications, loadNotificationsWorker),
    takeLatest(mainActions.hideNotification, hideNotificationWorker),
    takeLatest(mainActions.addLog, addLogWorker),
  ]);
}
