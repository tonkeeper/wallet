import { all, call, delay, put, select, takeLatest } from 'redux-saga/effects';
import { Alert, Keyboard } from 'react-native';
import BigNumber from 'bignumber.js';

import {
  walletActions,
  walletGeneratedVaultSelector,
  walletWalletSelector,
} from '$store/wallet/index';
import { UnlockedVault, Vault, VaultJSON } from '$blockchain';
import { mainActions } from '$store/main';
import { CryptoCurrencies } from '$shared/constants';
import { openAccessConfirmation, TabsStackRouteNames } from '$navigation';
import {
  CleanWalletAction,
  ConfirmSendCoinsAction,
  CreateWalletAction,
  DeployWalletAction,
  RestoreWalletAction,
  SendCoinsAction,
  ToggleBiometryAction,
  WalletGetUnlockedVaultAction,
} from '$store/wallet/interface';

import { Toast, useAddressUpdateStore, useConnectedAppsStore } from '$store';
import { t } from '@tonkeeper/shared/i18n';
import { getChainName } from '$shared/dynamicConfig';
import { toNano } from '$utils';
import { debugLog } from '$utils/debugLog';
import { Cell } from '@ton/core';
import nacl from 'tweetnacl';
import { Address, BASE_FORWARD_AMOUNT, encryptMessageComment } from '@tonkeeper/core';
import { navigate } from '$navigation/imperative';
import { trackEvent } from '$utils/stats';
import { tk } from '$wallet';
import { InscriptionAdditionalParams, TokenType } from '$core/Send/Send.interface';
import { WalletConfig, WalletContractVersion, WalletNetwork } from '$wallet/WalletTypes';
import { v4 as uuidv4 } from 'uuid';
import { vault as multiWalletVault } from '$wallet';
import RNRestart from 'react-native-restart';

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
    const generatedVault = (yield select(walletGeneratedVaultSelector)) as UnlockedVault;

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

    if (isBiometryEnabled) {
      yield call([tk, 'enableBiometry'], pin!);
    }

    const identifiers = yield call(
      [tk, 'importWallet'],
      generatedVault.mnemonic,
      pin!,
      versions,
      walletConfig,
    );

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

    const wallet = yield select(walletWalletSelector);

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
          commentValue,
        );
        fee = estimatedFee;
        isBattery = battery;
      } else if (tokenType === TokenType.TON) {
        const [estimatedFee, battery] = yield call(
          [wallet.ton, 'estimateFee'],
          address,
          amount,
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
      encryptedCommentPrivateKey,
    } = action.payload;

    const wallet = yield select(walletWalletSelector);

    const walletAddress = wallet.address.rawAddress;

    let commentValue: Cell | string = comment;

    if (
      !tk.wallet.isExternal &&
      isCommentEncrypted &&
      comment.length > 0 &&
      encryptedCommentPrivateKey
    ) {
      const recipientPubKey = yield call([wallet.ton, 'getPublicKeyByAddress'], address);

      const encryptedCommentCell = yield call(
        encryptMessageComment,
        comment,
        wallet.vault.tonPublicKey,
        recipientPubKey,
        encryptedCommentPrivateKey,
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
        commentValue,
        sendWithBattery,
        BigNumber(toNano(fee)).plus(BASE_FORWARD_AMOUNT.toString()).toString(),
      );
    } else if (tokenType === TokenType.TON && currency === CryptoCurrencies.Ton) {
      yield call(
        [wallet.ton, 'transfer'],
        address,
        amount,
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
        commentValue,
      );
    } else {
      Alert.alert('not supported');
      onFail();
      return;
    }

    yield call([tk.wallet.activityList, 'reload']);

    onDone();
  } catch (e) {
    action.payload.onFail(e);
    console.error(e);
    e && debugLog(e.message);

    if (e && e.message === 'wrong_time') {
      Alert.alert(
        t('send_sending_wrong_time_title'),
        t('send_sending_wrong_time_description'),
      );

      return;
    }
  }
}

function* cleanWalletWorker(action: CleanWalletAction) {
  const cleanAll = !!action.payload?.cleanAll;
  try {
    if (cleanAll) {
      tk.wallets.forEach((wallet) => {
        useConnectedAppsStore.getState().actions.unsubscribeFromAllNotifications(
          wallet.isTestnet ? 'testnet' : 'mainnet',
          Address.parse(wallet.address.ton.raw).toFriendly({
            bounceable: true,
            testOnly: wallet.isTestnet,
          }),
        );
      });

      yield call([tk, 'removeAllWallets']);
      RNRestart.restart();
    } else {
      yield call(
        useConnectedAppsStore.getState().actions.unsubscribeFromAllNotifications,
        getChainName(),
        Address.parse(tk.wallet.address.ton.raw).toFriendly({
          bounceable: true,
          testOnly: tk.wallet.isTestnet,
        }),
      );

      yield call([tk, 'removeWallet'], tk.wallet.identifier);

      yield call(trackEvent, 'reset_wallet');

      if (tk.wallets.size > 0) {
        navigate(TabsStackRouteNames.Balances);
      } else {
        RNRestart.restart();
      }
    }
  } catch (e) {
    e && debugLog(e.message);
    yield put(Toast.fail, e.message);
  }
}

let WaitAccessConfirmationPromise: {
  resolve: (_: UnlockedVault) => void;
  reject: () => void;
} | null = null;
export function waitAccessConfirmation(
  withoutBiometryOnOpen?: boolean,
  walletIdentifier?: string,
) {
  return new Promise<UnlockedVault>((resolve, reject) => {
    WaitAccessConfirmationPromise = { resolve, reject };
    openAccessConfirmation(withoutBiometryOnOpen, walletIdentifier);
  });
}

export function getCurrentConfirmationVaultPromise(): any {
  return WaitAccessConfirmationPromise!;
}

export function confirmationVaultReset() {
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
    const wallet = action?.payload?.walletIdentifier
      ? tk.wallets.get(action.payload.walletIdentifier)!
      : tk.walletForUnlock;

    let withoutBiometryOnOpen = false;

    if (tk.biometryEnabled) {
      try {
        const passcode = yield call([multiWalletVault, 'exportPasscodeWithBiometry']);
        const mnemonic = yield call(
          [multiWalletVault, 'exportWithPasscode'],
          wallet.identifier,
          passcode,
        );
        const unlockedVault = new UnlockedVault(
          {
            ...wallet.config,
            tonPubkey: Uint8Array.from(Buffer.from(wallet.pubkey, 'hex')),
          },
          mnemonic,
        );

        setLastEnteredPasscode(passcode);

        action?.payload?.onDone?.(unlockedVault);
        return unlockedVault;
      } catch {
        withoutBiometryOnOpen = true;
      }
    }

    const vault = yield call(
      waitAccessConfirmation,
      withoutBiometryOnOpen,
      wallet.identifier,
    );
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

function* deployWalletWorker(action: DeployWalletAction) {
  try {
    const unlockedVault = yield call(walletGetUnlockedVault);
    const wallet = yield select(walletWalletSelector);

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

export function* walletSaga() {
  yield all([
    takeLatest(walletActions.generateVault, generateVaultWorker),
    takeLatest(walletActions.createWallet, createWalletWorker),
    takeLatest(walletActions.restoreWallet, restoreWalletWorker),
    takeLatest(walletActions.confirmSendCoins, confirmSendCoinsWorker),
    takeLatest(walletActions.sendCoins, sendCoinsWorker),
    takeLatest(walletActions.cleanWallet, cleanWalletWorker),
    takeLatest(walletActions.deployWallet, deployWalletWorker),
    takeLatest(walletActions.toggleBiometry, toggleBiometryWorker),
    takeLatest(walletActions.walletGetUnlockedVault, walletGetUnlockedVault),
  ]);
}
