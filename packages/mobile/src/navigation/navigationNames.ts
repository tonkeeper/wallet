import { NavigationProp } from '@react-navigation/native';

export enum AppStackRouteNames {
  MainStack = 'MainStack',
  Receive = 'Receive',
  Send = 'Send',
  ChooseCountry = 'ChooseCountry',
  ScanQR = 'ScanQR',
  RequireWalletModal = 'RequireWalletModal',
  NFTSend = 'NFTSend',
  Subscription = 'Subscription',
  BuyFiat = 'BuyFiat',
  ModalContainer = 'ModalContainer',
  Invoice = 'Invoice',
  Migration = 'Migration',
  AccessConfirmation = 'AccessConfirmation',
  MainAccessConfirmation = 'MainAccessConfirmation',
  ChangePin = 'ChangePin',
  NFT = 'NFT',
  WebView = 'WebView',
  DevStack = 'DevStack',
  DAppsSearch = 'DAppsSearch',
  DAppBrowser = 'DAppBrowser',
  StakingSend = 'StakingSend',
  Swap = 'Swap',
  ReceiveInscription = 'ReceiveInscription',
  CustomizeWallet = 'CustomizeWallet',
}

export enum MainStackRouteNames {
  Start = 'Start',
  CreateWalletStack = 'CreateWalletStack',
  ImportWalletStack = 'ImportWalletStack',
  AddWatchOnly = 'AddWatchOnly',
  Tabs = 'Tabs',
  Wallet = 'Wallet',
  Staking = 'Staking',
  StakingPools = 'StakingPools',
  StakingPoolDetails = 'StakingPoolDetails',
  Subscriptions = 'Subscriptions',
  BackupWords = 'BackupWords',
  DeleteAccountDone = 'DeleteAccountDone',
  DevStack = 'DevStack',
  Jetton = 'Jetton',
  ManageTokens = 'ManageTokens',
  AddressUpdateInfo = 'AddressUpdateInfo',
  Inscription = 'Inscription',
}

export enum TabsStackRouteNames {
  Balances = 'Balances',
  NFT = 'TabNFT',
  BrowserStack = 'BrowserStack',
  SettingsStack = 'SettingsStack',
  Activity = 'Activity',
}

export enum BrowserStackRouteNames {
  Explore = 'Explore',
  Category = 'Category',
}

export enum SettingsStackRouteNames {
  Settings = 'Settings',
  DevMenu = 'DevMenu',
  Logs = 'Logs',
  Security = 'Security',
  LegalDocuments = 'LegalDocuments',
  FontLicense = 'FontLicense',
  Notifications = 'Notifications',
  ChooseCurrency = 'ChooseCurrency',
  RefillBattery = 'RefillBattery',
}

export enum ActivityStackRouteNames {
  Activity = 'Settings',
  NotificationsActivity = 'NotificationsActivity',
  Notifications = 'Notifications',
}

export enum DevComponents {
  DevComponentList = 'DevComponentList',
  DevDeeplinking = 'DevDeeplinking',
  DevText = 'DevText',
  DevToast = 'DevToast',
  DevSignRawExamples = 'DevSignRawExamples',
  DevWalletStore = 'DevWalletStore',
  DevListComponent = 'DevListComponent',
}

type ScreenNames =
  | `${AppStackRouteNames}`
  | `${MainStackRouteNames}`
  | `${TabsStackRouteNames}`
  | `${SettingsStackRouteNames}`
  | `${DevComponents}`;

type ScreenProps = { [key in ScreenNames]: any };

export type NavProp = NavigationProp<ScreenProps>;
