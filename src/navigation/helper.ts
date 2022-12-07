import { createRef } from 'react';
import { StackActions } from '@react-navigation/routers';
import {
  NavigationContainerRef,
  CommonActions,
  useRoute,
  createNavigationContainerRef,
} from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';

import {
  AppStackRouteNames,
  MainStackRouteNames,
  ResetPinStackRouteNames,
  SecurityMigrationStackRouteNames,
  SettingsStackRouteNames,
  SetupWalletStackRouteNames,
  TabsStackRouteNames,
} from '$navigation/navigationNames';
import { CryptoCurrencies, CryptoCurrency } from '$shared/constants';
import { EventKey } from '$store/events/interface';
import { SubscriptionModel } from '$store/models';
import { ModalName } from '$core/ModalContainer/ModalContainer.interface';
import { NFTKeyPair } from '$store/nfts/interface';
import { DeployModalProps } from '$core/ModalContainer/NFTOperations/Modals/DeployModal';
import { mergeRefs } from '$utils/mergeRefs';
import { shouldOpenReminderNotifications } from '$utils/messaging';
import { AppearanceBottomSheetProps } from '$core/ModalContainer/AppearanceBottomSheet/AppearanceBottomSheet.interface';
import { ExchangeDB } from '$core/ModalContainer/ExchangeMethod/ExchangeDB';
import { MarketplacesModalProps } from '$core/ModalContainer/Marketplaces/Marketplaces.interface';
import { AddEditFavoriteAddressProps } from '$core/ModalContainer/AddEditFavoriteAddress/AddEditFavoriteAddress.interface';
import { Action } from 'tonapi-sdk-js';
import { TonConnectModalProps } from '$core/TonConnect/models';
import { store } from '$store'

export const navigationRef_depreceted = createRef<NavigationContainerRef>();
export const navigationRef = createNavigationContainerRef();

export const setNavigationRef = mergeRefs(navigationRef_depreceted, navigationRef);

let navigationIsReady = false;
export const getCurrentRouteName = () => {
  if (navigationIsReady) {
    return navigationRef.getCurrentRoute()?.name;
  }

  return null;
};

export const onNavigationReady = () => {
  navigationIsReady = true;
};

export function getCurrentRoute() {
  if (!navigationRef_depreceted.current) {
    return null;
  }

  const state = navigationRef_depreceted.current.getRootState();
  let route = state?.routes?.[state.index];

  while (route?.state?.index !== undefined && route?.state?.index !== null) {
    route = route.state.routes[route.state.index];
  }

  return route ?? null;
}

export function navigate(name: string, params?: any) {
  navigationRef_depreceted.current?.navigate(name, params);
}

export function replace(name: string, params?: any) {
  navigationRef_depreceted.current?.dispatch(StackActions.replace(name, params));
}

export function push(routeName: string, params?: any) {
  navigationRef_depreceted.current?.dispatch(StackActions.push(routeName, params));
}

export function popToTop() {
  navigationRef_depreceted.current?.dispatch(StackActions.popToTop());
}

export function popTo(count: number) {
  navigationRef_depreceted.current?.dispatch(StackActions.pop(count));
}

export function goBack() {
  navigationRef_depreceted.current?.goBack();
}

export function reset(screenName: string) {
  navigationRef_depreceted.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: screenName }],
    }),
  );
}

export function openBalancesTab() {
  navigate(TabsStackRouteNames.Balances);
}

export function openWallet(currency: CryptoCurrency) {
  push(MainStackRouteNames.Wallet, {
    currency,
  });
}

export function openAction(eventKey: EventKey, action: Action) {
  push(AppStackRouteNames.ModalContainer, {
    modalName: ModalName.ACTION,
    key: 'ACTION',
    eventKey,
    action,
  });
}

export function openEditCoins() {
  push(AppStackRouteNames.ModalContainer, {
    modalName: ModalName.EDIT_COINS,
    key: 'EDIT_COINS',
  });
}

export function openRequireWalletModal() {
  navigate(AppStackRouteNames.ModalContainer, {
    modalName: ModalName.REQUIRE_WALLET,
    key: 'REQUIRE_WALLET',
  });
}

export function openReceive(
  currency: CryptoCurrency,
  isJetton?: boolean,
  jettonAddress?: string,
  isFromMainScreen?: boolean,
) {
  navigate(AppStackRouteNames.Receive, {
    currency,
    isJetton,
    jettonAddress,
    isFromMainScreen,
  });
}

export function openSend(
  currency?: CryptoCurrency | string,
  address?: string,
  comment?: string,
  withGoBack?: boolean,
  isJetton?: boolean,
  amount?: string,
  fee?: string,
  isInactive?: boolean,
) {
  navigate(AppStackRouteNames.Send, {
    currency,
    address,
    comment,
    withGoBack,
    isJetton,
    amount,
    fee,
    isInactive,
  });
}

export function openDeploy(props: DeployModalProps) {
  push(AppStackRouteNames.ModalContainer, {
    modalName: ModalName.DEPLOY,
    key: 'DEPLOY',
    ...props,
  });
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

export function openCreateWallet() {
  navigate(AppStackRouteNames.SetupWalletStack, {
    screen: SetupWalletStackRouteNames.CreateWallet,
  });
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
  } else if (
    getCurrentRoute()?.name === SecurityMigrationStackRouteNames.SecurityMigration ||
    getCurrentRoute()?.name === SecurityMigrationStackRouteNames.AccessConfirmation
  ) {
    navigate(SecurityMigrationStackRouteNames.CreatePin);
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
  } else if (
    getCurrentRoute()?.name === SecurityMigrationStackRouteNames.CreatePin ||
    getCurrentRoute()?.name === SecurityMigrationStackRouteNames.SecurityMigration
  ) {
    navigate(SecurityMigrationStackRouteNames.SetupBiometry, {
      pin,
      biometryType,
    });
  } else {
    navigate(MainStackRouteNames.SetupBiometry, {
      pin,
      biometryType,
    });
  }
}

export function openSetupNotifications() {
  navigate(SetupWalletStackRouteNames.SetupNotifications);
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

export function openSetupBiometryAfterMigration(
  pin: string,
  biometryType: LocalAuthentication.AuthenticationType,
) {
  push(SecurityMigrationStackRouteNames.SetupBiometry, {
    pin,
    biometryType,
  });
}

export function openSetupWalletDone() {
  if (
    getCurrentRoute()?.name === SetupWalletStackRouteNames.SetupCreatePin ||
    getCurrentRoute()?.name === SetupWalletStackRouteNames.SetupBiometry ||
    getCurrentRoute()?.name === SetupWalletStackRouteNames.SetupNotifications
  ) {
    navigate(AppStackRouteNames.SetupWalletStack, {
      screen: SetupWalletStackRouteNames.SetupWalletDone,
    });
  } else if (
    getCurrentRoute()?.name === SecurityMigrationStackRouteNames.SetupBiometry ||
    getCurrentRoute()?.name === SecurityMigrationStackRouteNames.SecurityMigration
  ) {
    navigate(SecurityMigrationStackRouteNames.SetupWalletDone);
  } else {
    navigate(MainStackRouteNames.ImportWalletDone, {});
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

export function openExchangeModal() {
  push(AppStackRouteNames.ModalContainer, {
    modalName: ModalName.EXCHANGE,
    key: 'EXCHANGE',
  });
}

export async function openExchangeMethodModal(methodId: string) {
  const isShowDetails = await ExchangeDB.isShowDetails(methodId);
  if (isShowDetails) {
    push(AppStackRouteNames.ModalContainer, {
      modalName: ModalName.EXCHANGE_METHOD,
      key: 'EXCHANGE_METHOD',
      methodId,
    });
  } else {
    openBuyFiat(CryptoCurrencies.Ton, methodId);
  }
}

export function openTonConnect(props: TonConnectModalProps) {
  if (store.getState().wallet.wallet) {
    navigate(AppStackRouteNames.ModalContainer, {
      modalName: ModalName.TON_LOGIN,
      ...props,
    });
  } else { 
    openRequireWalletModal();
  }
}

export function openCreateSubscription(invoiceId: string) {
  navigate(AppStackRouteNames.ModalContainer, {
    modalName: ModalName.CREATE_SUBSCRIPTION,
    key: 'CREATE_SUBSCRIPTION',
    invoiceId,
  });
}

export function openSubscription(
  subscription: SubscriptionModel,
  fee: string | null = null,
) {
  push(AppStackRouteNames.ModalContainer, {
    modalName: ModalName.SUBSCRIPTION,
    key: 'SUBSCRIPTION',
    subscription,
    fee,
  });
}

export function openInactiveInfo() {
  push(AppStackRouteNames.ModalContainer, {
    modalName: ModalName.INFO_ABOUT_INACTIVE,
    key: 'INFO_ABOUT_INACTIVE',
  });
}

export function openAppearance(props?: AppearanceBottomSheetProps) {
  navigate(AppStackRouteNames.ModalContainer, {
    modalName: ModalName.APPEARANCE,
    ...props,
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

export function openAccessConfirmation() {
  if (getCurrentRoute()?.name === SecurityMigrationStackRouteNames.SecurityMigration) {
    navigate(SecurityMigrationStackRouteNames.AccessConfirmation);
  } else {
    navigate(AppStackRouteNames.AccessConfirmation);
  }
}

export function openSecurity() {
  push(SettingsStackRouteNames.Security);
}

export function openJettonsList() {
  push(MainStackRouteNames.JettonsList);
}

export function openJettonsListSettingsStack() {
  push(SettingsStackRouteNames.JettonsList);
}

export function openChangePin() {
  push(AppStackRouteNames.ChangePin);
}

export function openResetPin() {
  push(AppStackRouteNames.ResetPin);
}

export function openSecurityMigration() {
  navigate(SecurityMigrationStackRouteNames.SecurityMigration);
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

export async function openReminderEnableNotificationsModal() {
  const shouldOpen = await shouldOpenReminderNotifications();
  if (shouldOpen) {
    push(AppStackRouteNames.ModalContainer, {
      modalName: ModalName.REMINDER_ENABLE_NOTIFICATIONS,
    });
  }
}

export async function openMarketplaces(props?: MarketplacesModalProps) {
  push(AppStackRouteNames.ModalContainer, {
    modalName: ModalName.MARKETPLACES,
    ...props,
  });
}

export function openAddFavorite(props: Omit<AddEditFavoriteAddressProps, 'isEdit'>) {
  navigate(AppStackRouteNames.ModalContainer, {
    modalName: ModalName.ADD_EDIT_FAVORITE_ADDRESS,
    ...props,
    isEdit: false,
  });
}

export function openEditFavorite(props: Omit<AddEditFavoriteAddressProps, 'isEdit'>) {
  navigate(AppStackRouteNames.ModalContainer, {
    modalName: ModalName.ADD_EDIT_FAVORITE_ADDRESS,
    ...props,
    isEdit: true,
  });
}

export function openLinkingDomain(params: {
  walletAddress?: string;
  domainAddress: string;
  domain: string;
  onDone?: (options: { walletAddress?: string }) => void;
}) {
  navigate(AppStackRouteNames.ModalContainer, {
    modalName: ModalName.LINKING_DOMAIN,
    ...params,
  });
}

export function openReplaceDomainAddress(params: {
  domain: string;
  onReplace: (address: string) => void;
}) {
  push(AppStackRouteNames.ModalContainer, {
    modalName: ModalName.REPLACE_DOMAIN_ADDRESS,
    ...params,
  });
}

export const useParams = <T>(): Partial<T> => {
  const route = useRoute();
  return route.params ?? {};
};
