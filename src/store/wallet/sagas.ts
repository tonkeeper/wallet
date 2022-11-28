import { all, call, delay, fork, put, select, takeLatest } from 'redux-saga/effects';
import { Alert, Keyboard } from 'react-native';
import BigNumber from 'bignumber.js';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import { walletActions, walletSelector, walletWalletSelector } from '$store/wallet/index';
import { EncryptedVault, UnlockedVault, Vault, Wallet } from '$blockchain';
import { mainActions } from '$store/main';
import { CryptoCurrencies, PrimaryCryptoCurrencies } from '$shared/constants';
import {
  goBack,
  openAccessConfirmation,
  openBackupWords,
  openCreatePin,
  openMigration,
  openSetupBiometryAfterMigration,
  openSetupWalletDone,
} from '$navigation';
import {
  ChangeBalanceAndReloadAction,
  ChangePinAction,
  ConfirmSendCoinsAction,
  CreateWalletAction,
  DeployWalletAction,
  MigrateAction,
  OpenMigrationAction,
  RefreshBalancesPageAction,
  ReloadBalanceTwiceAction,
  RestoreWalletAction,
  SendCoinsAction,
  ToggleBiometryAction,
  TransferCoinsAction,
  WaitMigrationAction,
  WalletGetUnlockedVaultAction,
} from '$store/wallet/interface';
import { eventsActions } from '$store/events';
import { ratesActions } from '$store/rates';
import {
  clearHiddenNotification,
  clearPrimaryFiatCurrency,
  getMigrationState,
  MainDB,
  saveAddedCurrencies,
  saveBalancesToDB,
  saveFavorites,
  saveHiddenRecentAddresses,
  saveSubscriptions,
  setIntroShown,
  setIsTestnet,
  setLastRefreshedAt,
  setMigrationState,
} from '$database';
import { batchActions } from '$store';
import { toastActions } from '$store/toast';
import { subscriptionsActions } from '$store/subscriptions';
import { t } from '$translation';
import { initHandler } from '$store/main/sagas';
import { getTokenConfig, getWalletName } from '$shared/dynamicConfig';
import { withRetryCtx } from '$store/retry';
import { Cache } from '$store/events/manager/cache';
import { destroyEventsManager } from '$store/events/sagas';
import { debugLog, detectBiometryType, toNano, trackEvent } from '$utils';
import { Api } from '$api';
import { nftsActions } from '$store/nfts';
import { jettonsActions } from '$store/jettons';
import { Ton } from '$libs/Ton';
import { Cache as JettonsCache } from '$store/jettons/manager/cache';
import { Tonapi } from '$libs/Tonapi';
import TonWeb from 'tonweb';
import { clearSubscribeStatus } from '$utils/messaging';

function* generateVaultWorker() {
  try {
    const vault = yield call(Vault.generate, getWalletName());
    yield put(walletActions.setGeneratedVault(vault));
    yield call(trackEvent, 'generate_wallet');
  } catch (e) {
    e && debugLog(e.message);
    yield call(Alert.alert, 'Wallet generation error', e.message);
  }
}

function* restoreWalletWorker(action: RestoreWalletAction) {
  try {
    const { mnemonics, onDone, config } = action.payload;

    const vault = yield call(
      Vault.restore,
      getWalletName(),
      mnemonics,
      undefined,
      config,
    );
    yield put(walletActions.loadCurrentVersion(vault.getVersion()));
    yield put(walletActions.setGeneratedVault(vault));
    onDone();

    yield call(trackEvent, 'import_wallet');
  } catch (e) {
    e && debugLog(e.message);
    yield put(toastActions.fail(e.message));
    action.payload.onFail();
  }
}

function* createWalletWorker(action: CreateWalletAction) {
  const { onDone, onFail, pin, isBiometryEnabled } = action.payload;
  try {
    const { generatedVault } = yield select(walletSelector);

    yield call(MainDB.enableNewSecurityFlow);

    const encryptedVault = yield call([generatedVault, 'encrypt'], pin);
    const vault = yield call([encryptedVault, 'lock']);
    if (isBiometryEnabled) {
      yield call([generatedVault, 'lock']);
      yield call(MainDB.setBiometryEnabled, true);
    } else {
      yield call(MainDB.setBiometryEnabled, false);
    }

    const wallet = new Wallet(getWalletName(), vault);
    yield call([wallet, 'save']);

    yield put(
      batchActions(
        mainActions.setHasWallet(true),
        mainActions.setUnlocked(true),
        walletActions.setWallet(wallet),
      ),
    );

    yield put(walletActions.loadBalances());
    yield put(eventsActions.loadEvents({ isReplace: true }));
    yield put(nftsActions.loadNFTs({ isReplace: true }));
    yield put(jettonsActions.loadJettons());
    onDone();

    yield call(trackEvent, 'create_wallet');
  } catch (e) {
    console.debug({ createWalletError: e });
    e && debugLog(e.message);
    if (e.message && e.message.indexOf('-25293') > -1) {
      yield put(toastActions.fail(t('pin_enter_faceid_err')));
    } else if (e.message && e.message.indexOf('-127') > -1) {
      yield put(toastActions.fail(t('pin_enter_skip_faceid_err')));
    } else {
      yield put(toastActions.fail(e.message));
    }
    onFail && onFail();
  }
}

function* loadBalancesWorker() {
  try {
    const { wallet } = yield select(walletSelector);
    if (!wallet) {
      yield put(
        batchActions(walletActions.endLoading(), walletActions.endRefreshBalancesPage()),
      );
      return;
    }

    const [tonAddress] = yield all([call([wallet.ton, 'getAddress'])]);

    const addresses: { [index: string]: string } = {
      [CryptoCurrencies.Ton]: tonAddress,
    };

    const tokenBalanceLoaders: any[] = [];
    const loadTokenNames: string[] = [];

    yield put(walletActions.setAddress(addresses));

    const [tonBalance, ...otherTokens] = yield all([
      withRetryCtx('tonBalances', [
        wallet.ton,
        wallet.ton.isLockup() ? 'getLockupBalances' : 'getBalance',
      ]),
      ...tokenBalanceLoaders,
    ]);

    const tokenBalances: { [index: string]: string } = {};
    for (let i = 0; i < otherTokens.length; i++) {
      tokenBalances[loadTokenNames[i]] = otherTokens[i];
    }

    const balances: any = {
      ...tokenBalances,
    };

    if (wallet.ton.isLockup()) {
      balances[CryptoCurrencies.Ton] = tonBalance[0];
      balances[CryptoCurrencies.TonRestricted] = tonBalance[1];
      balances[CryptoCurrencies.TonLocked] = tonBalance[2];
    } else {
      balances[CryptoCurrencies.Ton] = tonBalance;
    }

    yield call(saveBalances, balances);

    yield put(
      batchActions(
        walletActions.setBalances(balances),
        walletActions.endLoading(),
        mainActions.dismissBadHosts(),
      ),
    );

    yield fork(checkLegacyBalances);
  } catch (e) {
    console.log('loadBalancesTask ERR', e);
    e && debugLog(e.message);

    yield delay(3000);
    yield put(walletActions.loadBalances());
  }
}

function* transferCoinsWorker(action: TransferCoinsAction) {
  try {
    const { address, amount, currency } = action.payload;
    const { wallet } = yield select(walletSelector);

    const unlockedVault = yield call([wallet, 'unlock']);

    if (currency === CryptoCurrencies.Ton) {
      const res = yield call([wallet.ton, 'transfer'], address, amount, unlockedVault);
      Alert.alert('RES', `${JSON.stringify(res)}`);
    }
  } catch (e) {
    console.log(e);
    yield call(Alert.alert, 'Send coins error', JSON.stringify(e));
  }
}

function* checkLegacyBalances() {
  try {
    const balances: any = [];
    const wallet = yield select(walletWalletSelector);
    const wallets = yield call([wallet.ton, 'getAllAddresses']);
    delete wallets.v4R2;

    for (let address of Object.entries(wallets)) {
      const balance = yield withRetryCtx(
        `checkLegacyBalance_${address[0]}`,
        [Tonapi, 'getWalletInfo'],
        address[1] as any,
      );
      if (balance.balance > 0) {
        balances.push({
          balance: balance.balance,
          version: address[0],
        });
      }
    }

    yield put(walletActions.setOldWalletBalance(balances));
  } catch (e) {}
}

function* switchVersionWorker() {
  const { wallet, version } = yield select(walletSelector);
  if (!wallet) {
    return;
  }
  wallet.vault.setVersion(version);
  const walletName = getWalletName();
  const newWallet = new Wallet(walletName, wallet.vault);
  yield call([newWallet, 'save']);
  yield put(walletActions.setWallet(newWallet));

  yield put(eventsActions.resetEvents());
  yield call(destroyEventsManager);
  yield call(Cache.clearAll, walletName);
  yield call(JettonsCache.clearAll, walletName);
  yield put(walletActions.refreshBalancesPage());
}

function* refreshBalancesPageWorker(action: RefreshBalancesPageAction) {
  try {
    yield put(walletActions.loadBalances());
    yield put(eventsActions.loadEvents({ isReplace: true, ignoreCache: action.payload }));
    yield put(nftsActions.loadNFTs({ isReplace: true }));
    yield put(jettonsActions.getIsFeatureEnabled());
    yield put(jettonsActions.loadJettons());
    yield put(ratesActions.loadRates({ onlyCache: false }));
    yield put(mainActions.loadNotifications());
    yield call(setLastRefreshedAt, Date.now());
    yield put(subscriptionsActions.loadSubscriptions());
  } catch (e) {
    yield put(walletActions.endRefreshBalancesPage());
  }
}

function* confirmSendCoinsWorker(action: ConfirmSendCoinsAction) {
  try {
    const {
      address,
      currency,
      amount,
      comment = '',
      onEnd,
      onNext,
      isJetton,
      jettonWalletAddress,
      decimals = 0,
    } = action.payload;

    if (!onEnd) {
      yield put(toastActions.loading());
    }

    const { wallet } = yield select(walletSelector);
    const tokenConfig = getTokenConfig(currency);

    let isUninit = false;
    let fee: string = '0';
    let isEstimateFeeError = false;
    try {
      if (isJetton) {
        fee = yield call(
          [wallet.ton, 'estimateJettonFee'],
          jettonWalletAddress,
          address,
          toNano(amount, decimals),
          wallet.vault,
          comment,
        );
      }
      if (currency === CryptoCurrencies.Ton) {
        fee = yield call(
          [wallet.ton, 'estimateFee'],
          address,
          amount,
          wallet.vault,
          comment,
        );
        isUninit = yield call([wallet.ton, 'isInactiveAddress'], address);
      }
    } catch (e) {
      console.log(e);
      e && debugLog(e.message);
      isEstimateFeeError = true;
    }

    if (onEnd) {
      yield call(onEnd);
    } else {
      yield put(toastActions.hide());
    }
    yield call(Keyboard.dismiss);
    yield delay(100);

    if (onNext) {
      yield call(onNext, { fee, isInactive: isUninit });
    }

    if (isEstimateFeeError) {
      yield delay(300);
      yield put(toastActions.fail(t('send_fee_estimation_error')));
    }
  } catch (e) {
    e && debugLog(e.message);
    yield put(toastActions.fail(e.message));
    if (action.payload.onEnd) {
      yield call(action.payload.onEnd);
    }
  }
}

function* sendCoinsWorker(action: SendCoinsAction) {
  try {
    const {
      currency,
      amount,
      address,
      comment,
      onDone,
      onFail,
      isSendAll,
      isJetton,
      jettonWalletAddress,
      decimals,
    } = action.payload;

    const featureEnabled = yield call(Api.get, '/feature/enabled', {
      params: {
        currency,
        feature: 'send_crypto',
      },
    });
    if (!featureEnabled.enabled) {
      throw new Error(featureEnabled.message);
    }

    const { wallet } = yield select(walletSelector);

    const unlockedVault = yield call(walletGetUnlockedVault);

    if (isJetton) {
      yield call(
        [wallet.ton, 'jettonTransfer'],
        jettonWalletAddress,
        address,
        toNano(amount, decimals),
        unlockedVault,
        comment,
      );
    } else if (currency === CryptoCurrencies.Ton) {
      yield call(
        [wallet.ton, 'transfer'],
        address,
        amount,
        unlockedVault,
        comment,
        isSendAll ? 128 : 3,
      );
    } else {
      Alert.alert('not supported');
      onFail();
      return;
    }

    yield put(eventsActions.pollEvents());

    yield put(
      walletActions.changeBalanceAndReload({
        currency,
        amount: `-${amount}`,
      }),
    );

    onDone();
  } catch (e) {
    action.payload.onFail();
    e && debugLog(e.message);

    if (e.message === 'wrong_time') {
      MainDB.setTimeSyncedDismissed(false);
      yield put(mainActions.setTimeSyncedDismissed(false));
      Alert.alert(
        t('send_sending_wrong_time_title'),
        t('send_sending_wrong_time_description'),
      );

      return;
    }

    yield put(toastActions.fail(e ? e.message : t('send_sending_failed')));
  }
}

function* reloadBalance(currency: CryptoCurrencies) {
  const { wallet, balances } = yield select(walletSelector);

  const tokenConfig = getTokenConfig(currency);
  let amount: string = '0';

  if (currency === CryptoCurrencies.Ton && wallet.ton.isLockup()) {
    const balances = yield call([wallet.ton, 'getLockupBalances']);

    yield put(
      walletActions.setBalances({
        [CryptoCurrencies.Ton]: balances[0],
        [CryptoCurrencies.TonRestricted]: balances[1],
        [CryptoCurrencies.TonLocked]: balances[2],
      }),
    );

    if (balances[currency] !== balances[0]) {
      yield put(eventsActions.loadEvents({ isReplace: true }));
    }
  } else {
    if (PrimaryCryptoCurrencies.indexOf(currency) > -1) {
      amount = yield call([wallet[currency], 'getBalance']);
    }

    if (balances[currency] !== amount) {
      yield put(eventsActions.loadEvents({ isReplace: true }));
    }

    yield put(
      walletActions.setBalances({
        [currency]: amount,
      }),
    );
  }
}

function* changeBalanceAndReloadWorker(action: ChangeBalanceAndReloadAction) {
  try {
    const { currency } = action.payload;
    yield call(reloadBalance, currency);
  } catch (e) {}
}

function* reloadBalanceWorker(action: ReloadBalanceTwiceAction) {
  try {
    const currency = action.payload;
    yield call(reloadBalance, currency);
  } catch (e) {}
}

function* reloadBalanceTwiceWorker(action: ReloadBalanceTwiceAction) {
  try {
    const currency = action.payload;
    yield call(reloadBalance, currency);
    yield delay(3000);
    yield call(reloadBalance, currency);
  } catch (e) {}
}

function* backupWalletWorker() {
  try {
    const unlockedVault = yield call(walletGetUnlockedVault);
    yield call(openBackupWords, unlockedVault.mnemonic);
  } catch (e) {
    e && debugLog(e.message);
    yield put(toastActions.fail(e ? e.message : t('auth_failed')));
  }
}

function* cleanWalletWorker() {
  try {
    const { wallet } = yield select(walletSelector);
    const isNewFlow = yield call(MainDB.isNewSecurityFlow);

    const walletName = getWalletName();
    yield call(Cache.clearAll, walletName);
    yield call(clearSubscribeStatus);
    yield call(JettonsCache.clearAll, walletName);

    if (isNewFlow) {
      try {
        yield call([wallet.vault, 'clean']);
        yield call([wallet.vault, 'cleanBiometry']);
      } catch (e) {}
    } else {
      try {
        yield call([wallet.vault, 'clean']);
      } catch (e) {}
    }

    yield call([wallet, 'clean']);
    yield call(saveSubscriptions, []);
    yield call(saveAddedCurrencies, []);
    yield call(setIntroShown, false);
    yield call(setIsTestnet, false);
    yield call(clearPrimaryFiatCurrency);
    yield call(clearHiddenNotification);
    yield call(saveBalancesToDB, {});
    yield call(MainDB.setBiometryEnabled, false);
    yield call(MainDB.setExcludedJettons, {});
    yield call(saveFavorites, []);
    yield call(saveHiddenRecentAddresses, []);

    yield put(
      batchActions(
        mainActions.resetMain(),
        walletActions.reset(),
        walletActions.resetVersion(),
        eventsActions.resetEvents(),
        nftsActions.resetNFTs(),
        jettonsActions.resetJettons(),
        ratesActions.resetRates(),
        subscriptionsActions.reset(),
      ),
    );

    yield call(initHandler, false);

    yield call(trackEvent, 'reset_wallet');
  } catch (e) {
    e && debugLog(e.message);
    yield put(toastActions.fail(e.message));
  }
}

let WaitAccessConfirmationPromise: {
  resolve: (_: UnlockedVault) => void;
  reject: () => void;
} | null = null;
let ConfirmationVaultInst: EncryptedVault | UnlockedVault | null = null;
export function waitAccessConfirmation(vault: EncryptedVault | UnlockedVault) {
  return new Promise<UnlockedVault>((resolve, reject) => {
    ConfirmationVaultInst = vault; // can't pass as navigation prop, because vault is non-serializable
    WaitAccessConfirmationPromise = { resolve, reject };
    openAccessConfirmation();
  });
}

export function getCurrentConfirmationVaultInst(): EncryptedVault | UnlockedVault {
  return ConfirmationVaultInst!;
}

export function getCurrentConfirmationVaultPromise(): any {
  return WaitAccessConfirmationPromise!;
}

export function confirmationVaultReset() {
  ConfirmationVaultInst = null;
  WaitAccessConfirmationPromise = null;
}

let LastEnteredPasscode: string = '';
export function setLastEnteredPasscode(pin: string) {
  LastEnteredPasscode = pin;
}

export function getLastEnteredPasscode() {
  return LastEnteredPasscode;
}

export class UnlockVaultError extends Error {}

export function* walletGetUnlockedVault(action?: WalletGetUnlockedVaultAction) {
  try {
    const isNewFlow = yield call(MainDB.isNewSecurityFlow);
    const { wallet } = yield select(walletSelector);
    if (isNewFlow) {
      const vault = yield call(waitAccessConfirmation, wallet.vault);
      action?.payload?.onDone?.(vault);
      return vault;
    } else {
      const vault = yield call([wallet.vault, 'unlock']);
      if (vault.needsDecrypt) {
        const decryptedVault = yield call(waitAccessConfirmation, vault);
        action?.payload?.onDone?.(decryptedVault);
        return decryptedVault;
      } else {
        action?.payload?.onDone?.(vault);
        return vault;
      }
    }
  } catch (e) {
    e && debugLog(e.message);

    const err =
      e && e.message && e.message.indexOf('-127') > -1
        ? new UnlockVaultError(t('auth_failed'))
        : new UnlockVaultError(e ? e.message : t('access_denied'));

    if (action?.payload?.onFail) {
      action.payload.onFail(err);
    } else {
      throw err;
    }
  }
}

function* saveBalances(balances: { [index: string]: string }) {
  try {
    yield call(saveBalancesToDB, balances);
  } catch (e) {}
}

function* openMigrationWorker(action: OpenMigrationAction) {
  try {
    const { wallet } = yield select(walletSelector);
    const fromVersion =
      action.payload && action.payload.fromVersion
        ? action.payload.fromVersion
        : wallet.vault.getVersion() ?? 'v3R2';

    yield put(toastActions.loading());

    const tonweb = wallet.ton.getTonWeb();
    const [oldAddress, newAddress] = yield all([
      call([wallet.ton, 'getAddressByWalletVersion'], fromVersion),
      call([wallet.ton, 'getAddressByWalletVersion'], 'v4R2'),
    ]);

    const [oldInfo, newInfo] = yield all([
      call([tonweb.provider, 'getWalletInfo'], oldAddress),
      call([tonweb.provider, 'getWalletInfo'], newAddress),
    ]);

    const migrationState = yield call(getMigrationState);
    yield put(toastActions.hide());
    openMigration(
      fromVersion,
      oldAddress,
      newAddress,
      !!migrationState,
      Ton.fromNano(oldInfo.balance),
      Ton.fromNano(newInfo.balance),
      action.payload ? !!action.payload.isTransfer : false,
    );
  } catch (e) {
    e && debugLog(e.message);
    yield put(toastActions.fail(e.message));
  }
}

function* migrateWorker(action: MigrateAction) {
  try {
    const { oldAddress, newAddress, fromVersion } = action.payload;

    const featureEnabled = yield call(Api.get, '/feature/enabled', {
      params: {
        feature: 'migration',
      },
    });
    if (!featureEnabled.enabled) {
      throw new Error(featureEnabled.message);
    }

    const { wallet } = yield select(walletSelector);
    const oldInfo = yield call([wallet.ton, 'getWalletInfo'], oldAddress);
    const newInfo = yield call([wallet.ton, 'getWalletInfo'], newAddress);
    yield call(setMigrationState, null);

    if (oldInfo.balance > 0) {
      const unlockedVault = yield call(walletGetUnlockedVault);
      const walletVersion = fromVersion ?? wallet.vault.getVersion() ?? 'v3R2';

      yield call(
        [wallet.ton, 'transfer'],
        newAddress,
        Ton.fromNano(oldInfo.balance),
        unlockedVault,
        '',
        128,
        walletVersion,
      );

      yield call(setMigrationState, {
        checkBalance: newInfo.balance,
        startAt: Date.now(),
        newAddress,
      });

      yield put(
        walletActions.waitMigration({
          onDone: action.payload.onDone,
          onFail: action.payload.onFail,
        }),
      );
    } else {
      yield call(doMigration, wallet, newAddress);
      action.payload.onDone();
    }
  } catch (e) {
    e && debugLog(e.message);
    action.payload.onFail();
    yield put(toastActions.fail(e.message));
    yield call(setMigrationState, null);
  }
}

function* doMigration(wallet: Wallet, newAddress: string) {
  try {
    wallet.vault.setVersion('v4R2');
    const walletName = getWalletName();
    const newWallet = new Wallet(walletName, wallet.vault);
    yield call([newWallet, 'save']);
    yield put(walletActions.setWallet(newWallet));

    yield put(
      batchActions(
        walletActions.setAddress({
          [CryptoCurrencies.Ton]: newAddress,
        }),
        eventsActions.resetEvents(),
        nftsActions.resetNFTs(),
        jettonsActions.resetJettons(),
      ),
    );
    yield call(destroyEventsManager);
    yield call(Cache.clearAll, walletName);
    yield call(JettonsCache.clearAll, walletName);
    yield put(walletActions.refreshBalancesPage());
    yield call(setMigrationState, null);
  } catch (e) {
    e && debugLog(e.message);
    yield put(toastActions.fail(e.message));
  }
}

function* waitMigrationWorker(action: WaitMigrationAction) {
  try {
    const state = yield call(getMigrationState);
    if (!state) {
      action.payload.onFail();
      return;
    }

    const { wallet } = yield select(walletSelector);

    while (true) {
      try {
        const info = yield call([wallet.ton, 'getWalletInfo'], state.newAddress);
        if (new BigNumber(info.balance).isGreaterThan(state.checkBalance)) {
          break;
        }
      } catch (e) {}

      if (Date.now() - state.startAt > 70 * 1000) {
        action.payload.onFail();
        yield put(toastActions.fail(t('migration_failed')));
        yield call(setMigrationState, null);
        return;
      }

      yield delay(3000);
    }

    yield call(doMigration, wallet, state.newAddress);
    action.payload.onDone();
  } catch (e) {
    e && debugLog(e.message);
    action.payload.onFail();
    yield call(setMigrationState, null);
  }
}

function* deployWalletWorker(action: DeployWalletAction) {
  try {
    const unlockedVault = yield call(walletGetUnlockedVault);
    const { wallet } = yield select(walletSelector);

    yield call([wallet.ton, 'deploy'], unlockedVault);
    action.payload.onDone();
  } catch (e) {
    e && debugLog(e.message);
    action.payload.onFail();
    yield call(setMigrationState, null);
  }
}

function* toggleBiometryWorker(action: ToggleBiometryAction) {
  const { isEnabled, onFail } = action.payload;

  try {
    if (isEnabled) {
      const vault = yield call(walletGetUnlockedVault);
      yield call([vault, 'lock']);
    } else {
      const { wallet } = yield select(walletSelector);
      yield call([wallet.vault, 'cleanBiometry']);
    }
    yield call(MainDB.setBiometryEnabled, isEnabled);
  } catch (e) {
    yield put(toastActions.fail(e.message));
    onFail();
  }
}

function* changePinWorker(action: ChangePinAction) {
  try {
    const { pin, vault } = action.payload;

    const encrypted = yield call([vault, 'encrypt'], pin);
    yield call([encrypted, 'lock']);
    yield put(toastActions.success('Passcode changed'));
    yield call(goBack);
  } catch (e) {
    yield put(toastActions.fail(e.message));
    yield call(goBack);
  }
}

function* securityMigrateWorker() {
  try {
    const vault = yield call(walletGetUnlockedVault);
    yield put(walletActions.setGeneratedVault(vault));

    const pin = getLastEnteredPasscode();
    if (pin) {
      const [types, isProtected] = yield all([
        call(LocalAuthentication.supportedAuthenticationTypesAsync),
        call(SecureStore.isAvailableAsync),
      ]);

      const biometryType = yield call(detectBiometryType, types);
      if (biometryType && isProtected) {
        yield call(openSetupBiometryAfterMigration, pin, biometryType);
      } else {
        yield put(
          walletActions.createWallet({
            pin,
            onDone: () => {
              openSetupWalletDone();
            },
            onFail: () => {},
          }),
        );
      }
    } else {
      yield call(openCreatePin);
    }
  } catch (e) {
    yield put(toastActions.fail(e.message));
  }
}

export function* walletSaga() {
  yield all([
    takeLatest(walletActions.generateVault, generateVaultWorker),
    takeLatest(walletActions.createWallet, createWalletWorker),
    takeLatest(walletActions.loadBalances, loadBalancesWorker),
    takeLatest(walletActions.restoreWallet, restoreWalletWorker),
    takeLatest(walletActions.transferCoins, transferCoinsWorker),
    takeLatest(walletActions.switchVersion, switchVersionWorker),
    takeLatest(walletActions.refreshBalancesPage, refreshBalancesPageWorker),
    takeLatest(walletActions.confirmSendCoins, confirmSendCoinsWorker),
    takeLatest(walletActions.sendCoins, sendCoinsWorker),
    takeLatest(walletActions.changeBalanceAndReload, changeBalanceAndReloadWorker),
    takeLatest(walletActions.reloadBalance, reloadBalanceWorker),
    takeLatest(walletActions.reloadBalanceTwice, reloadBalanceTwiceWorker),
    takeLatest(walletActions.backupWallet, backupWalletWorker),
    takeLatest(walletActions.cleanWallet, cleanWalletWorker),
    takeLatest(walletActions.openMigration, openMigrationWorker),
    takeLatest(walletActions.migrate, migrateWorker),
    takeLatest(walletActions.waitMigration, waitMigrationWorker),
    takeLatest(walletActions.deployWallet, deployWalletWorker),
    takeLatest(walletActions.toggleBiometry, toggleBiometryWorker),
    takeLatest(walletActions.changePin, changePinWorker),
    takeLatest(walletActions.securityMigrate, securityMigrateWorker),
    takeLatest(walletActions.walletGetUnlockedVault, walletGetUnlockedVault),
  ]);
}
