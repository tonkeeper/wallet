import * as LocalAuthentication from 'expo-local-authentication';
import {
  ActivityStackRouteNames,
  AppStackRouteNames,
  BrowserStackRouteNames,
  MainStackRouteNames,
  ResetPinStackRouteNames,
  SettingsStackRouteNames,
  SetupWalletStackRouteNames,
} from '$navigation/navigationNames';
import { CryptoCurrency } from '$shared/constants';
import { SendAnalyticsFrom } from '$store/models';
import { NFTKeyPair } from '$store/nfts/interface';
import _ from 'lodash';
import { getCurrentRoute, navigate, push, replace, reset } from './imperative';
import { CurrencyAdditionalParams, TokenType } from '$core/Send/Send.interface';
import { tk } from '$wallet';

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
  navigate(AppStackRouteNames.SetupWalletStack, {
    screen: SetupWalletStackRouteNames.SecretWords,
  });
}

export function openCheckSecretWords() {
  navigate(AppStackRouteNames.SetupWalletStack, {
    screen: SetupWalletStackRouteNames.CheckSecretWords,
  });
}

export function openCreatePin() {
  if (getCurrentRoute()?.name === SetupWalletStackRouteNames.CheckSecretWords) {
    navigate(AppStackRouteNames.SetupWalletStack, {
      screen: SetupWalletStackRouteNames.SetupCreatePin,
    });
  } else {
    navigate(MainStackRouteNames.CreatePin, {});
  }
}

export function openSetupBiometry(
  pin: string,
  biometryType: LocalAuthentication.AuthenticationType,
) {
  if (getCurrentRoute()?.name === SetupWalletStackRouteNames.SetupCreatePin) {
    navigate(AppStackRouteNames.SetupWalletStack, {
      screen: SetupWalletStackRouteNames.SetupBiometry,
      params: {
        pin,
        biometryType,
      },
    });
  } else {
    navigate(MainStackRouteNames.SetupBiometry, {
      pin,
      biometryType,
    });
  }
}

export function openSetupNotifications() {
  reset(SetupWalletStackRouteNames.SetupNotifications);
}

export function openImportSetupNotifications() {
  navigate(MainStackRouteNames.SetupNotifications);
}

export function openSetupBiometryAfterRestore(
  pin: string,
  biometryType: LocalAuthentication.AuthenticationType,
) {
  push(ResetPinStackRouteNames.SetupBiometry, {
    pin,
    biometryType,
  });
}

export function openSetupWalletDone() {
  navigate(MainStackRouteNames.Tabs);
  if (tk.wallets.size > 1) {
    navigate(AppStackRouteNames.CustomizeWallet);
  }
}

export function openImportWalletDone() {
  navigate(MainStackRouteNames.ImportWalletDone);
}

export function openDeleteAccountDone() {
  navigate(MainStackRouteNames.DeleteAccountDone);
}

export function openImportWallet() {
  navigate(MainStackRouteNames.ImportWallet);
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

export function openMigration(
  fromVersion: string,
  oldAddress: string,
  newAddress: string,
  migrationInProgress: boolean,
  oldBalance: string,
  newBalance: string,
  isTransfer: boolean,
) {
  navigate(AppStackRouteNames.Migration, {
    fromVersion,
    oldAddress,
    newAddress,
    migrationInProgress,
    oldBalance,
    newBalance,
    isTransfer,
  });
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

export function openResetPin() {
  push(AppStackRouteNames.ResetPin);
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
