import { all, call, delay, put, select, takeLatest } from 'redux-saga/effects';
import { Alert, Keyboard } from 'react-native';
import BigNumber from 'bignumber.js';

import { walletActions, walletSelector } from '$store/wallet/index';
import { EncryptedVault, UnlockedVault, Vault, VaultJSON } from '$blockchain';
import { mainActions } from '$store/main';
import { CryptoCurrencies, PrimaryCryptoCurrencies } from '$shared/constants';
import {
  openAccessConfirmation,
  openBackupWords,
  TabsStackRouteNames,
} from '$navigation';
import {
  ChangeBalanceAndReloadAction,
  ChangePinAction,
  ConfirmSendCoinsAction,
  CreateWalletAction,
  DeployWalletAction,
  ReloadBalanceTwiceAction,
  RestoreWalletAction,
  SendCoinsAction,
  ToggleBiometryAction,
  WalletGetUnlockedVaultAction,
} from '$store/wallet/interface';

import { MainDB } from '$database';
import { Toast, useAddressUpdateStore, useConnectedAppsStore } from '$store';
import { t } from '@tonkeeper/shared/i18n';
import { getChainName } from '$shared/dynamicConfig';
import { toNano } from '$utils';
import { debugLog } from '$utils/debugLog';
import { Ton } from '$libs/Ton';
import { Cell } from '@ton/core';
import nacl from 'tweetnacl';
import { BASE_FORWARD_AMOUNT, encryptMessageComment } from '@tonkeeper/core';
import { goBack, navigate } from '$navigation/imperative';
import { trackEvent } from '$utils/stats';
import { tk } from '$wallet';
import { getFlag } from '$utils/flags';
import { Address } from '@tonkeeper/shared/Address';
import { InscriptionAdditionalParams, TokenType } from '$core/Send/Send.interface';
import { WalletConfig, WalletContractVersion, WalletNetwork } from '$wallet/WalletTypes';
import { v4 as uuidv4 } from 'uuid';
import { vault as multiWalletVault } from '$wallet';

function* generateVaultWorker() {
  try {
    const vault = yield call(Vault.generate, uuidv4());
    yield put(walletActions.setGeneratedVault(vault));
    yield call(trackEvent, 'generate_wallet');
    // Dismiss addressUpdate banner for new wallets. It's not necessary to show it for newcomers
    useAddressUpdateStore.getState().actions.dismiss();
  } catch (e) {
    e && debugLog(e.message);
    yield call(Alert.alert, 'Wallet generation error', e.message);
  }
}

function* restoreWalletWorker(action: RestoreWalletAction) {
  try {
    const { mnemonic, onDone, config, versions } = action.payload;

    const vault = yield call(Vault.restore, uuidv4(), mnemonic, versions, config);
    yield put(walletActions.setGeneratedVault(vault));
    onDone();

    yield call(trackEvent, 'import_wallet');
  } catch (e) {
    e && debugLog(e.message);
    yield call(Toast.fail, e.message);
    action.payload.onFail();
  }
}

function* createWalletWorker(action: CreateWalletAction) {
  const { onDone, onFail, pin, isTestnet, isBiometryEnabled } = action.payload;
  try {
    const generatedVault = (yield select(walletSelector)).generatedVault as UnlockedVault;

    const vaultJson = (yield call([generatedVault, 'toJSON'])) as VaultJSON;

    const versions = generatedVault.versions as WalletContractVersion[];

    const walletConfig: Pick<
      WalletConfig,
      'network' | 'workchain' | 'configPubKey' | 'allowedDestinations'
    > = {
      network: isTestnet ? WalletNetwork.testnet : WalletNetwork.mainnet,
      workchain: vaultJson.workchain ?? 0,
      configPubKey: vaultJson.configPubKey,
      allowedDestinations: vaultJson.allowedDestinations,
    };

    const identifiers = yield call(
      [tk, 'importWallet'],
      generatedVault.mnemonic,
      pin!,
      versions,
      walletConfig,
    );
    if (isBiometryEnabled) {
      yield call([tk, 'enableBiometry'], pin!);
    }

    yield put(mainActions.setUnlocked(true));
    onDone(identifiers);

    yield call(trackEvent, 'create_wallet');
  } catch (e) {
    console.debug({ createWalletError: e });
    e && debugLog(e.message);
    if (e.message && e.message.indexOf('-25293') > -1) {
      yield call(Toast.fail, t('pin_enter_faceid_err'));
    } else if (e.message && e.message.indexOf('-127') > -1) {
      yield call(Toast.fail, t('pin_enter_skip_faceid_err'));
    } else {
      yield call(Toast.fail, e.message);
    }
    onFail && onFail();
  }
}

function* confirmSendCoinsWorker(action: ConfirmSendCoinsAction) {
  try {
    const {
      address,
      currency,
      amount,
      comment = '',
      isCommentEncrypted = false,
      onEnd,
      onNext,
      onInsufficientFunds,
      tokenType = TokenType.TON,
      isSendAll,
      jettonWalletAddress,
      decimals = 0,
      currencyAdditionalParams,
    } = action.payload;

    if (!onEnd) {
      yield call(Toast.loading);
    }

    const { wallet } = yield select(walletSelector);

    const walletAddress = wallet.address.rawAddress;

    let commentValue: Cell | string = comment;

    if (isCommentEncrypted && comment.length > 0) {
      try {
        const tempKeyPair = nacl.sign.keyPair();
        const tempEncryptedCommentCell = yield call(
          encryptMessageComment,
          comment,
          tempKeyPair.publicKey,
          tempKeyPair.publicKey,
          tempKeyPair.secretKey,
          walletAddress,
        );

        commentValue = tempEncryptedCommentCell;
      } catch (e) {
        onEnd?.();
        yield delay(300);
        yield call(Toast.fail, t('send_fee_estimation_error'));
        return;
      }
    }

    let isUninit = false;
    let fee: string = '0';
    let isBattery = false;
    let isEstimateFeeError = false;
    try {
      if (tokenType === TokenType.Jetton) {
        const [estimatedFee, battery] = yield call(
          [wallet.ton, 'estimateJettonFee'],
          jettonWalletAddress,
          address,
          toNano(amount, decimals),
          wallet.vault,
          commentValue,
        );
        fee = estimatedFee;
        isBattery = battery;
      } else if (tokenType === TokenType.TON) {
        const [estimatedFee, battery] = yield call(
          [wallet.ton, 'estimateFee'],
          address,
          amount,
          wallet.vault,
          commentValue,
          isSendAll ? 128 : 3,
        );
        fee = estimatedFee;
        isBattery = battery;
        isUninit = yield call([wallet.ton, 'isInactiveAddress'], address);
      } else if (tokenType === TokenType.Inscription) {
        const type = (currencyAdditionalParams as InscriptionAdditionalParams).type;
        const [estimatedFee, battery] = yield call(
          [wallet.ton, 'estimateInscriptionFee'],
          currency,
          type,
          address,
          toNano(amount, decimals!),
          wallet.vault,
          commentValue,
        );
        fee = estimatedFee;
        isBattery = battery;
      }
    } catch (e) {
      console.log(e);
      e && debugLog(e.message);
    } finally {
      if (fee === '0') {
        isEstimateFeeError = true;
      }
    }

    if (onEnd) {
      yield call(onEnd);
    } else {
      yield call(Toast.hide);
    }
    yield call(Keyboard.dismiss);
    yield delay(100);

    if (onNext) {
      if (
        (tokenType !== TokenType.TON || !isSendAll) &&
        !isBattery &&
        onInsufficientFunds
      ) {
        const amountNano =
          tokenType === TokenType.Jetton
            ? new BigNumber(toNano(fee)).plus(BASE_FORWARD_AMOUNT.toString()).toString()
            : new BigNumber(toNano(fee)).plus(toNano(amount)).toString();
        yield call([tk.wallet.balances, 'load']);
        const balance = toNano(tk.wallet.balances.state.data.ton);
        if (new BigNumber(amountNano).gt(new BigNumber(balance))) {
          return onInsufficientFunds({ totalAmount: amountNano, balance });
        } else {
          yield call(onNext, { fee, isInactive: isUninit, isBattery });
        }
      } else {
        yield call(onNext, { fee, isInactive: isUninit, isBattery });
      }
    }

    if (isEstimateFeeError) {
      yield delay(300);
      yield call(Toast.fail, t('send_fee_estimation_error'));
    }
  } catch (e) {
    e && debugLog(e.message);
    yield call(Toast.fail, e.message);
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
      isCommentEncrypted,
      fee,
      onDone,
      onFail,
      isSendAll,
      tokenType,
      jettonWalletAddress,
      decimals,
      sendWithBattery,
      currencyAdditionalParams,
    } = action.payload;

    const { wallet } = yield select(walletSelector);

    const unlockedVault = yield call(walletGetUnlockedVault);

    const walletAddress = wallet.address.rawAddress;

    let commentValue: Cell | string = comment;

    if (isCommentEncrypted && comment.length > 0) {
      const secretKey = yield call([unlockedVault, 'getTonPrivateKey']);

      const recipientPubKey = yield call([wallet.ton, 'getPublicKeyByAddress'], address);

      const encryptedCommentCell = yield call(
        encryptMessageComment,
        comment,
        wallet.vault.tonPublicKey,
        recipientPubKey,
        secretKey,
        walletAddress,
      );

      commentValue = encryptedCommentCell;
    }

    if (tokenType === TokenType.Jetton) {
      yield call(
        [wallet.ton, 'jettonTransfer'],
        jettonWalletAddress,
        address,
        toNano(amount, decimals),
        unlockedVault,
        commentValue,
        sendWithBattery,
        BigNumber(toNano(fee)).plus(BASE_FORWARD_AMOUNT.toString()).toString(),
      );
    } else if (tokenType === TokenType.TON && currency === CryptoCurrencies.Ton) {
      yield call(
        [wallet.ton, 'transfer'],
        address,
        amount,
        unlockedVault,
        commentValue,
        isSendAll ? 128 : 3,
      );
    } else if (tokenType === TokenType.Inscription) {
      const type = (currencyAdditionalParams as InscriptionAdditionalParams).type;
      yield call(
        [wallet.ton, 'inscriptionTransfer'],
        currency,
        type,
        address,
        toNano(amount, decimals!),
        unlockedVault,
        commentValue,
      );
    } else {
      Alert.alert('not supported');
      onFail();
      return;
    }

    yield call([tk.wallet.activityList, 'reload']);

    yield put(
      walletActions.changeBalanceAndReload({
        currency,
        amount: `-${amount}`,
      }),
    );

    onDone();
  } catch (e) {
    action.payload.onFail();
    console.error(e);
    e && debugLog(e.message);

    if (e && e.message === 'wrong_time') {
      MainDB.setTimeSyncedDismissed(false);
      yield put(mainActions.setTimeSyncedDismissed(false));
      Alert.alert(
        t('send_sending_wrong_time_title'),
        t('send_sending_wrong_time_description'),
      );

      return;
    }
  }
}

function* reloadBalance(currency: CryptoCurrencies) {
  try {
    const { wallet } = yield select(walletSelector);

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

      yield call(saveBalances, {
        [CryptoCurrencies.Ton]: balances[0],
        [CryptoCurrencies.TonRestricted]: balances[1],
        [CryptoCurrencies.TonLocked]: balances[2],
      });
    } else {
      if (PrimaryCryptoCurrencies.indexOf(currency) > -1) {
        amount = yield call([wallet[currency], 'getBalance']);
      }

      const balances = {
        [currency]: amount,
      };

      yield put(walletActions.setBalances(balances));

      yield call(saveBalances, balances);
    }
  } catch {}
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
    if (!e?.message) {
      return;
    }
    yield call(Toast.fail, e ? e.message : t('auth_failed'));
  }
}

function* cleanWalletWorker() {
  try {
    const { wallet } = yield select(walletSelector);

    yield call(
      useConnectedAppsStore.getState().actions.unsubscribeFromAllNotifications,
      getChainName(),
      wallet.address.friendlyAddress,
    );

    yield call([tk, 'removeWallet'], tk.wallet.identifier);

    yield call(trackEvent, 'reset_wallet');

    navigate(TabsStackRouteNames.Balances);
  } catch (e) {
    e && debugLog(e.message);
    yield put(Toast.fail, e.message);
  }
}

let WaitAccessConfirmationPromise: {
  resolve: (_: UnlockedVault) => void;
  reject: () => void;
} | null = null;
let ConfirmationVaultInst: EncryptedVault | UnlockedVault | null = null;
export function waitAccessConfirmation(
  vault: EncryptedVault | UnlockedVault,
  withoutBiometryOnOpen?: boolean,
) {
  return new Promise<UnlockedVault>((resolve, reject) => {
    ConfirmationVaultInst = vault; // can't pass as navigation prop, because vault is non-serializable
    WaitAccessConfirmationPromise = { resolve, reject };
    openAccessConfirmation(withoutBiometryOnOpen);
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
    const { wallet, generatedVault } = yield select(walletSelector);

    let withoutBiometryOnOpen = !!generatedVault;

    if (tk.biometryEnabled && !generatedVault) {
      try {
        const mnemonic = yield call(
          [multiWalletVault, 'exportWithBiometry'],
          tk.wallet.identifier,
        );
        const unlockedVault = new UnlockedVault(
          {
            ...wallet.config,
            tonPubkey: Uint8Array.from(Buffer.from(tk.wallet.pubkey, 'hex')),
          },
          mnemonic,
        );

        action?.payload?.onDone?.(unlockedVault);
        return unlockedVault;
      } catch {
        withoutBiometryOnOpen = true;
      }
    }

    const vault = yield call(waitAccessConfirmation, wallet.vault, withoutBiometryOnOpen);
    action?.payload?.onDone?.(vault);
    return vault;
  } catch (e) {
    e && debugLog(e.message);

    const err =
      e && e.message && e.message.indexOf('-127') > -1
        ? new UnlockVaultError(t('auth_failed'))
        : e;

    if (action?.payload?.onFail) {
      action.payload.onFail(err);
    } else {
      throw err;
    }
  }
}

function* saveBalances(balances: { [index: string]: string }) {
  try {
    const updatedAt = Date.now();

    yield put(walletActions.setUpdatedAt(updatedAt));
  } catch (e) {}
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
  }
}

function* toggleBiometryWorker(action: ToggleBiometryAction) {
  const { isEnabled, onFail } = action.payload;

  try {
    if (isEnabled) {
      yield call(walletGetUnlockedVault);
      yield call([tk, 'enableBiometry'], getLastEnteredPasscode());
    } else {
      yield call([tk, 'disableBiometry']);
    }
  } catch (e) {
    if (e.message) {
      yield call(Toast.fail, e.message);
    }
    onFail();
  }
}

function* changePinWorker(action: ChangePinAction) {
  try {
    const { pin, vault } = action.payload;

    const encrypted = yield call([vault, 'encrypt'], pin);
    yield call([encrypted, 'lock']);
  } catch (e) {
    yield call(Toast.fail, e.message);
    yield call(goBack);
  }
}

export function* walletSaga() {
  yield all([
    takeLatest(walletActions.generateVault, generateVaultWorker),
    takeLatest(walletActions.createWallet, createWalletWorker),
    takeLatest(walletActions.restoreWallet, restoreWalletWorker),
    takeLatest(walletActions.confirmSendCoins, confirmSendCoinsWorker),
    takeLatest(walletActions.sendCoins, sendCoinsWorker),
    takeLatest(walletActions.changeBalanceAndReload, changeBalanceAndReloadWorker),
    takeLatest(walletActions.reloadBalance, reloadBalanceWorker),
    takeLatest(walletActions.reloadBalanceTwice, reloadBalanceTwiceWorker),
    takeLatest(walletActions.backupWallet, backupWalletWorker),
    takeLatest(walletActions.cleanWallet, cleanWalletWorker),
    takeLatest(walletActions.deployWallet, deployWalletWorker),
    takeLatest(walletActions.toggleBiometry, toggleBiometryWorker),
    takeLatest(walletActions.changePin, changePinWorker),
    takeLatest(walletActions.walletGetUnlockedVault, walletGetUnlockedVault),
  ]);
}
