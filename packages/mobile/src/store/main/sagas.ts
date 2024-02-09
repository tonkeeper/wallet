import { all, takeLatest, put, call, delay, select } from 'redux-saga/effects';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import { i18n } from '$translation';
import { Platform } from 'react-native';

import { mainActions, mainSelector } from './index';
import { batchActions } from '$store';
import { walletActions } from '$store/wallet';
import * as SplashScreen from 'expo-splash-screen';
import { WalletCurrency, SelectableVersion } from '$shared/constants';
import {
  getHiddenNotifications,
  getIntroShown,
  getMigrationState,
  getSavedLogs,
  hideNotification,
  MainDB,
  setIntroShown,
  setSavedLogs,
} from '$database';
import { openRequireWalletModal } from '$core/ModalContainer/RequireWallet/RequireWallet';
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
  const showV4R1 = yield call(MainDB.getShowV4R1);
  const isIntroShown = yield call(getIntroShown);
  const timeSyncedDismissed = yield call(MainDB.timeSyncedDismissedTimestamp);

  initStats();

  trackFirstLaunch();
  trackEvent('launch_app');

  yield call([tk, 'init']);

  yield put(
    batchActions(
      mainActions.endInitiating({
        fiatCurrency: WalletCurrency.Usd,
      }),
      mainActions.setShowV4R1(showV4R1),
      mainActions.toggleIntro(!isIntroShown),
      mainActions.setTimeSyncedDismissed(timeSyncedDismissed),
    ),
  );

  const logs = yield call(getSavedLogs);
  yield put(mainActions.setLogs(logs));

  if (tk.wallet) {
    yield put(
      walletActions.loadCurrentVersion(
        tk.wallet.config.version as unknown as SelectableVersion,
      ),
    );
    useSwapStore.getState().actions.fetchAssets();
  }

  yield put(mainActions.loadNotifications());

  yield put(favoritesActions.loadSuggests());
  yield put(mainActions.getTimeSynced());
  yield put(walletActions.endLoading());
  SplashScreen.hideAsync();

  yield delay(1000);
  const walletMigrationState = yield call(getMigrationState);
  if (walletMigrationState) {
    yield put(walletActions.openMigration());
  }
}

function* completeIntroWorker() {
  try {
    yield call(setIntroShown, true);
    yield delay(300);
    yield call(openRequireWalletModal);
  } catch (e) {}
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
    takeLatest(mainActions.completeIntro, completeIntroWorker),
    takeLatest(mainActions.loadNotifications, loadNotificationsWorker),
    takeLatest(mainActions.hideNotification, hideNotificationWorker),
    takeLatest(mainActions.addLog, addLogWorker),
  ]);
}
