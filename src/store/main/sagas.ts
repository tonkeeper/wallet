import { all, takeLatest, put, call, fork, delay, select } from 'redux-saga/effects';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import DeviceInfo from 'react-native-device-info';
import { i18n } from '$translation';
import { Platform } from 'react-native';
import BigNumber from 'bignumber.js';

import { mainActions, mainSelector } from './index';
import { Wallet } from '$blockchain';
import { batchActions } from '$store';
import { walletActions, walletSelector } from '$store/wallet';
import { ratesActions } from '$store/rates';
import * as SplashScreen from 'expo-splash-screen';
import { eventsActions } from '$store/events';
import {
  API_SECRET,
  FiatCurrencies,
  getServerConfig,
  ServerConfigVersion,
  setServerConfig,
  updateServerConfig,
} from '$shared/constants';
import {
  getAddedCurrencies,
  getBalances,
  getHiddenNotifications,
  getIntroShown,
  getIsTestnet,
  getMigrationState,
  getPrimaryFiatCurrency,
  getSavedLogs,
  getSavedServerConfig,
  hideNotification,
  JettonsDB,
  MainDB,
  saveBalancesToDB,
  setIntroShown,
  setIsTestnet,
  setPrimaryFiatCurrency,
  setSavedLogs,
  setSavedServerConfig,
} from '$database';
import { openRequireWalletModal } from '$navigation';
import { toastActions } from '$store/toast';
import { subscriptionsActions } from '$store/subscriptions';
import {
  HideNotificationAction,
  SetAccentAction,
  SetFiatCurrencyAction,
  SetTonCustomIcon,
  ToggleTestnetAction,
} from '$store/main/interface';
import { withRetry } from '$store/retry';
import { InternalNotificationModel } from '$store/models';
import { exchangeActions } from '$store/exchange';
import { Cache } from '$store/events/manager/cache';
import { Cache as JettonsCache } from '$store/jettons/manager/cache';
import { getWalletName } from '$shared/dynamicConfig';
import { destroyEventsManager } from '$store/events/sagas';
import { initStats } from '$utils';
import { nftsActions } from '$store/nfts';
import { jettonsActions } from '$store/jettons';
import { favoritesActions } from '$store/favorites';
import { reloadSubscriptionsFromServer } from '$store/subscriptions/sagas';
import { clearSubscribeStatus } from '$utils/messaging';

SplashScreen.preventAutoHideAsync()
  .then((result) =>
    console.log(`SplashScreen.preventAutoHideAsync() succeeded: ${result}`),
  )
  .catch(console.warn); // it's good to explicitly catch and inspect any error

function* loadServerConfig(isTestnet: boolean, canRetry = false) {
  const apiToken = jwt.sign({ app: 'ton.app' }, API_SECRET);

  const endpoint = 'https://boot.tonkeeper.com/keys';
  const params = {
    token: apiToken,
    chainName: isTestnet ? 'testnet' : 'mainnet',
    lang: i18n.locale,
    build: DeviceInfo.getReadableVersion(),
    platform: Platform.OS,
  };

  let resp: any;
  if (canRetry) {
    yield delay(5000);
    resp = yield withRetry('loadServerConfig', axios.get, endpoint, {
      params,
    });
  } else {
    try {
      resp = yield call(axios.get, endpoint, { params });
    } catch (e) {
      return null;
    }
  }

  yield call(setSavedServerConfig, resp.data, isTestnet);

  return resp.data;
}

function* initWorker() {
  BigNumber.config({ EXPONENTIAL_AT: 1e9 });

  const isTestnet = yield call(getIsTestnet);
  yield put(mainActions.setTestnet(isTestnet));
  yield call(initHandler, isTestnet);
}

export function* initHandler(isTestnet: boolean, canRetry = false) {
  let serverConfig = yield call(getSavedServerConfig, isTestnet);
  let devConfig = yield call(MainDB.getDevConfig);
  const isHasCache = !!serverConfig;
  let needRefreshConfig = true;
  if (!serverConfig || serverConfig._version !== ServerConfigVersion) {
    serverConfig = yield call(loadServerConfig, isTestnet, canRetry);
    needRefreshConfig = false;
  }
  const showV4R1 = yield call(MainDB.getShowV4R1);
  const currencies = yield call(getAddedCurrencies);
  const isIntroShown = yield call(getIntroShown);
  const primaryCurrency = yield call(getPrimaryFiatCurrency);
  const balances = yield call(getBalances);
  const isNewSecurityFlow = yield call(MainDB.isNewSecurityFlow);
  const jettonsEnabled = yield call(MainDB.isJettonsEnabled);
  const excludedJettons = yield call(MainDB.getExcludedJettons);
  const accent = yield call(MainDB.getAccent);
  const tonCustomIcon = yield call(MainDB.getTonCustomIcon);
  const jettonBalances = yield call(JettonsDB.getJettonBalances);
  const timeSyncedDismissed = yield call(MainDB.timeSyncedDismissedTimestamp);

  if (!isNewSecurityFlow) {
    yield put(mainActions.setUnlocked(true));
  }

  if (!serverConfig) {
    const wallet = yield call(Wallet.load);
    yield put(
      batchActions(
        mainActions.endInitiating({
          isHasWallet: !!wallet,
          fiatCurrency: primaryCurrency || FiatCurrencies.Usd,
        }),
        walletActions.endLoading(),
        mainActions.toggleIntro(!isIntroShown),
        walletActions.setWallet(wallet),
        walletActions.setCurrencies(currencies),
        subscriptionsActions.reset(),
        walletActions.setBalances(balances),
        jettonsActions.setJettonBalances({ jettonBalances }),
      ),
    );

    yield fork(loadRates, true);

    SplashScreen.hideAsync();

    yield call(initHandler, isTestnet, true);
    return;
  }
  setServerConfig(serverConfig, isTestnet);
  updateServerConfig(devConfig);

  initStats();

  yield fork(loadRates, true);

  const wallet = yield call(Wallet.load);

  yield put(
    batchActions(
      mainActions.endInitiating({
        isHasWallet: !!wallet,
        fiatCurrency: primaryCurrency || FiatCurrencies.Usd,
      }),
      mainActions.setShowV4R1(showV4R1),
      jettonsActions.setShowJettons(jettonsEnabled),
      jettonsActions.setExcludedJettons(excludedJettons),
      mainActions.toggleIntro(!isIntroShown),
      walletActions.setWallet(wallet),
      walletActions.setCurrencies(currencies),
      subscriptionsActions.reset(),
      walletActions.setBalances(balances),
      mainActions.setAccent(accent),
      mainActions.setTonCustomIcon(tonCustomIcon),
      jettonsActions.setJettonBalances({ jettonBalances }),
      mainActions.setTimeSyncedDismissed(timeSyncedDismissed),
    ),
  );

  if (isHasCache) {
    yield put(walletActions.endLoading());
  }

  const logs = yield call(getSavedLogs);
  yield put(mainActions.setLogs(logs));

  if (wallet) {
    yield put(walletActions.loadCurrentVersion(wallet.vault.getVersion()));
    yield put(walletActions.loadBalances());
    yield put(eventsActions.loadEvents({ isReplace: true }));
    yield put(nftsActions.loadNFTs({ isReplace: true }));
    yield put(jettonsActions.loadJettons());
    yield put(subscriptionsActions.loadSubscriptions());
    const { wallet: walletNew } = yield select(walletSelector);
    yield call([walletNew.ton, 'getAddress']);
  } else {
    yield put(walletActions.endLoading());
  }

  yield put(mainActions.loadNotifications());

  yield fork(loadRates);
  yield put(exchangeActions.loadMethods());
  yield put(nftsActions.loadMarketplaces());
  yield put(favoritesActions.loadSuggests());
  yield put(mainActions.getTimeSynced());

  SplashScreen.hideAsync();

  if (needRefreshConfig) {
    yield loadServerConfig(isTestnet, true);
  }

  yield delay(1000);
  const walletMigrationState = yield call(getMigrationState);
  if (walletMigrationState) {
    yield put(walletActions.openMigration());
  }
}

function* loadRates(onlyCache = false) {
  try {
    yield put(ratesActions.loadRates({ onlyCache }));
  } catch (e) {}
}

function* completeIntroWorker() {
  try {
    yield call(setIntroShown, true);
    yield delay(300);
    yield call(openRequireWalletModal);
  } catch (e) {}
}

export function* resetAll(isTestnet: boolean) {
  yield call(destroyEventsManager);
  yield call(Cache.clearAll, getWalletName());
  yield call(clearSubscribeStatus);
  yield call(JettonsCache.clearAll, getWalletName());
  yield put(
    batchActions(
      mainActions.resetMain(),
      walletActions.reset(),
      eventsActions.resetEvents(),
      walletActions.resetVersion(),
      nftsActions.resetNFTs(),
      jettonsActions.resetJettons(),
      ratesActions.resetRates(),
      mainActions.setTestnet(isTestnet),
      subscriptionsActions.reset(),
    ),
  );
  yield call(saveBalancesToDB, {});
  yield call(setIsTestnet, isTestnet);
  yield call(initHandler, isTestnet);
}

function* toggleTestnetWorker(action: ToggleTestnetAction) {
  try {
    const { isTestnet } = action.payload;
    const mainState = yield select(mainSelector);

    if (mainState.isTestnet === isTestnet) {
      return;
    }

    yield call(resetAll, isTestnet);
  } catch (e) {
    yield put(toastActions.fail(e.message));
  }
}

function* setFiatCurrencyWorker(action: SetFiatCurrencyAction) {
  try {
    yield call(setPrimaryFiatCurrency, action.payload);
  } catch (e) {}
}

function* loadNotificationsWorker() {
  try {
    const data = yield withRetry(
      'loadNotificationsWorker',
      axios.get,
      `${getServerConfig('tonkeeperEndpoint')}/notifications`,
      {
        params: {
          platform: Platform.OS,
          version: DeviceInfo.getReadableVersion(),
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

function* setAccentWorker(action: SetAccentAction) {
  try {
    yield call(MainDB.setAccent, action.payload);
  } catch (e) {}
}

function* setTonCustomIconWorker(action: SetTonCustomIcon) {
  try {
    yield call(MainDB.setTonCustomIcon, action.payload);
  } catch (e) {}
}

function* getTimeSyncedWorker() {
  try {
    const endpoint = `${getServerConfig('tonapiIOEndpoint')}/v1/system/time`;

    const response = yield call(axios.get, endpoint, {
      headers: { Authorization: `Bearer ${getServerConfig('tonApiKey')}` },
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
    takeLatest(mainActions.toggleTestnet, toggleTestnetWorker),
    takeLatest(mainActions.setFiatCurrency, setFiatCurrencyWorker),
    takeLatest(mainActions.loadNotifications, loadNotificationsWorker),
    takeLatest(mainActions.hideNotification, hideNotificationWorker),
    takeLatest(mainActions.setAccent, setAccentWorker),
    takeLatest(mainActions.setTonCustomIcon, setTonCustomIconWorker),
    takeLatest(mainActions.addLog, addLogWorker),
  ]);
}
