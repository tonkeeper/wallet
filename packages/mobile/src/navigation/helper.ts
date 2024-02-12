import * as LocalAuthentication from 'expo-local-authentication';
import {
  ActivityStackRouteNames,
  AppStackRouteNames,
  BrowserStackRouteNames,
  MainStackRouteNames,
  SettingsStackRouteNames,
} from '$navigation/navigationNames';
import { CryptoCurrency } from '$shared/constants';
import { SendAnalyticsFrom } from '$store/models';
import { NFTKeyPair } from '$store/nfts/interface';
import _ from 'lodash';
import { getCurrentRoute, navigate, push, replace } from './imperative';
import { CurrencyAdditionalParams, TokenType } from '$core/Send/Send.interface';
import { tk } from '$wallet';
import { CreateWalletStackRouteNames } from './CreateWalletStack/types';
import { ImportWalletStackRouteNames } from './ImportWalletStack/types';
import { AddWatchOnlyStackRouteNames } from './AddWatchOnlyStack/types';

export function openExploreTab(initialCategory?: string) {
  navigate(BrowserStackRouteNames.Explore, { initialCategory });
}

export interface OpenSendParams {
  currency?: CryptoCurrency | string;
  address?: string;
  comment?: string;
  withGoBack?: boolean;
  tokenType?: TokenType;
  amount?: string;
  fee?: string;
  isInactive?: boolean;
  from?: SendAnalyticsFrom;
  expiryTimestamp?: number | null;
  redirectToActivity?: boolean;
  currencyAdditionalParams?: CurrencyAdditionalParams;
}

export function openSend(params: OpenSendParams = {}) {
  navigate(AppStackRouteNames.Send, params);
}

export function openDAppsSearch(
  initialQuery?: string,
  onOpenUrl?: (url: string) => void,
) {
  navigate(AppStackRouteNames.DAppsSearch, { initialQuery, onOpenUrl });
}

export function openDAppBrowser(url: string) {
  const params = { url };
  if (getCurrentRoute()?.name === AppStackRouteNames.DAppsSearch) {
    replace(AppStackRouteNames.DAppBrowser, params);
  } else {
    navigate(AppStackRouteNames.DAppBrowser, params);
  }
}

export function openScanQR(onScan: (url: string) => void) {
  navigate(AppStackRouteNames.ScanQR, { onScan });
}

export function openSecretWords() {
  navigate(CreateWalletStackRouteNames.SecretWords);
}

export function openCheckSecretWords() {
  navigate(CreateWalletStackRouteNames.CheckSecretWords);
}

export function openCreatePin() {
  if (getCurrentRoute()?.name === CreateWalletStackRouteNames.CheckSecretWords) {
    navigate(CreateWalletStackRouteNames.CreatePasscode);
  } else {
    navigate(ImportWalletStackRouteNames.CreatePasscode);
  }
}

export function openSetupBiometry(
  pin: string,
  biometryType: LocalAuthentication.AuthenticationType,
) {
  if (getCurrentRoute()?.name === CreateWalletStackRouteNames.CreatePasscode) {
    navigate(CreateWalletStackRouteNames.Biometry, {
      pin,
      biometryType,
    });
  } else {
    navigate(ImportWalletStackRouteNames.Biometry, {
      pin,
      biometryType,
    });
  }
}

export function openSetupNotifications(identifiers: string[]) {
  if (
    getCurrentRoute()?.name === CreateWalletStackRouteNames.Biometry ||
    getCurrentRoute()?.name === CreateWalletStackRouteNames.CheckSecretWords
  ) {
    replace(CreateWalletStackRouteNames.Notifications, { identifiers });
  } else if (getCurrentRoute()?.name === AddWatchOnlyStackRouteNames.AddWatchOnly) {
    console.log('sadasdasdasd');
    replace(AddWatchOnlyStackRouteNames.Notifications, { identifiers });
  } else {
    replace(ImportWalletStackRouteNames.Notifications, { identifiers });
  }
}

export function openSetupWalletDone(identifiers: string[]) {
  replace(MainStackRouteNames.Tabs);
  if (tk.wallets.size > 1 && tk.wallets.size !== identifiers.length) {
    navigate(AppStackRouteNames.CustomizeWallet, { identifiers });
  }
}

export function openDeleteAccountDone() {
  navigate(MainStackRouteNames.DeleteAccountDone);
}

export function openBackupWords(mnemonic: string) {
  navigate(MainStackRouteNames.BackupWords, {
    mnemonic,
  });
}

export function openBuyFiat(currency: CryptoCurrency, methodId: string) {
  navigate(AppStackRouteNames.BuyFiat, {
    currency,
    methodId,
  });
}

export function openSubscriptions() {
  navigate(MainStackRouteNames.Subscriptions);
}

export function openDevMenu() {
  push(SettingsStackRouteNames.DevMenu);
}

export function openLogs() {
  push(SettingsStackRouteNames.Logs);
}

export function openLegalDocuments() {
  push(SettingsStackRouteNames.LegalDocuments);
}

export function openFontLicense() {
  push(SettingsStackRouteNames.FontLicense);
}

export function openAccessConfirmation(withoutBiometryOnOpen?: boolean) {
  navigate(AppStackRouteNames.AccessConfirmation, {
    withoutBiometryOnOpen,
  });
}

export function openSecurity() {
  push(SettingsStackRouteNames.Security);
}

export function openRefillBattery() {
  push(SettingsStackRouteNames.RefillBattery);
}

export function openManageTokens(initialTab?: string) {
  _.throttle(() => {
    push(MainStackRouteNames.ManageTokens, { initialTab });
  }, 1000)();
}

export function openChangePin() {
  push(AppStackRouteNames.ChangePin);
}

export function openNFT(keyPair: NFTKeyPair) {
  navigate('NFTItemDetails', { keyPair });
}

export function openWebView(webViewUrl: string) {
  navigate(AppStackRouteNames.WebView, {
    webViewUrl,
  });
}

export function openNotifications() {
  push(SettingsStackRouteNames.Notifications);
}

export function openJetton(jettonAddress: string) {
  navigate(MainStackRouteNames.Jetton, {
    jettonAddress,
  });
}

export async function openChooseCountry() {
  navigate(AppStackRouteNames.ChooseCountry);
}

export function openNotificationsScreen() {
  navigate(ActivityStackRouteNames.NotificationsActivity);
}

export function openTonInscription(params: { ticker: string; type: string }) {
  navigate(MainStackRouteNames.Inscription, params);
}
