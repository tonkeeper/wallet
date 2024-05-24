import {
  ActivityStackRouteNames,
  AppStackRouteNames,
  BrowserStackRouteNames,
  MainStackRouteNames,
  SettingsStackRouteNames,
  TabsStackRouteNames,
} from '$navigation/navigationNames';
import { CryptoCurrency } from '$shared/constants';
import { SendAnalyticsFrom } from '$store/models';
import { NFTKeyPair } from '$store/nfts/interface';
import _ from 'lodash';
import { getCurrentRoute, navigate, push, replace, reset } from './imperative';
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
  isBattery?: boolean;
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

export function openDAppBrowser(
  url: string,
  persistentQueryParams?: string,
  disableSearchBar?: boolean,
) {
  const params = { url, persistentQueryParams, disableSearchBar };
  if (getCurrentRoute()?.name === AppStackRouteNames.DAppsSearch) {
    replace(AppStackRouteNames.DAppBrowser, params);
  } else {
    navigate(AppStackRouteNames.DAppBrowser, params);
  }
}

export function openScanQR(onScan: (url: string) => void) {
  navigate(AppStackRouteNames.ScanQR, { onScan });
}

export function openSetupNotifications(identifiers: string[]) {
  if (getCurrentRoute()?.name === CreateWalletStackRouteNames.CreatePasscode) {
    replace(CreateWalletStackRouteNames.Notifications, { identifiers });
  } else if (getCurrentRoute()?.name === AddWatchOnlyStackRouteNames.AddWatchOnly) {
    replace(AddWatchOnlyStackRouteNames.Notifications, { identifiers });
  } else {
    replace(ImportWalletStackRouteNames.Notifications, { identifiers });
  }
}

export function resetToWalletTab() {
  navigate(TabsStackRouteNames.Balances);
}

export function openSetupWalletDone(identifiers: string[]) {
  reset(MainStackRouteNames.Tabs);

  if (tk.wallets.size > 1 && tk.wallets.size !== identifiers.length) {
    navigate(AppStackRouteNames.CustomizeWallet, { identifiers });
  }
}

export function openDeleteAccountDone() {
  navigate(MainStackRouteNames.DeleteAccountDone);
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

export function openAccessConfirmation(
  withoutBiometryOnOpen?: boolean,
  walletIdentifier?: string,
) {
  navigate(AppStackRouteNames.AccessConfirmation, {
    withoutBiometryOnOpen,
    walletIdentifier,
  });
}

export function openSecurity() {
  push(SettingsStackRouteNames.Security);
}

export function openSelectLanguage() {
  push(SettingsStackRouteNames.Language);
}

export function openRefillBatteryModal() {
  push(AppStackRouteNames.RefillBattery);
}

export function openManageTokens(initialTab?: string) {
  _.throttle(() => {
    push(MainStackRouteNames.ManageTokens, { initialTab });
  }, 1000)();
}

export function openChangePin() {
  push(MainStackRouteNames.ChangePin);
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

export function openVouchers() {
  navigate(MainStackRouteNames.Vouchers);
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
