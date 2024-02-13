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
  MainDB,
  setSavedLogs,
} from '$database';
import { HideNotificationAction } from '$store/main/interface';
import { withRetry } from '$store/retry';
import { InternalNotificationModel } from '$store/models';

import { initStats, trackEvent, trackFirstLaunch } from '$utils/stats';
import { favoritesActions } from '$store/favorites';
import { useSwapStore } from '$store/zustand/swap';
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
  const timeSyncedDismissed = yield call(MainDB.timeSyncedDismissedTimestamp);

  initStats();

  trackFirstLaunch();
  trackEvent('launch_app');

  yield call([tk, 'init']);

  yield put(
    batchActions(
      mainActions.endInitiating(),
      mainActions.setTimeSyncedDismissed(timeSyncedDismissed),
    ),
  );

  const logs = yield call(getSavedLogs);
  yield put(mainActions.setLogs(logs));

  if (tk.wallet) {
    useSwapStore.getState().actions.fetchAssets();
  }

  yield put(mainActions.loadNotifications());

  yield put(favoritesActions.loadSuggests());
  yield put(mainActions.getTimeSynced());
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

function* getTimeSyncedWorker() {
  try {
    const endpoint = `${config.get('tonapiV2Endpoint')}/v2/liteserver/get_time`;

    const response = yield call(axios.get, endpoint, {
      headers: { Authorization: `Bearer ${config.get('tonApiV2Key')}` },
    });
    const time = response?.data?.time;
    const isSynced = Math.abs(Date.now() - time * 1000) <= 7000;

    if (isSynced) {
      yield call(MainDB.setTimeSyncedDismissed, false);
      yield put(mainActions.setTimeSyncedDismissed(false));
    }

    yield put(mainActions.setTimeSynced(isSynced));
  } catch (e) {
    console.log(e);
  }
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
    takeLatest(mainActions.getTimeSynced, getTimeSyncedWorker),
    takeLatest(mainActions.loadNotifications, loadNotificationsWorker),
    takeLatest(mainActions.hideNotification, hideNotificationWorker),
    takeLatest(mainActions.addLog, addLogWorker),
  ]);
}
