import { NavigationProp } from '@react-navigation/native';

export enum ModalStackRouteNames {
  TokenDetails = 'TokenDetails',
}

export enum AppStackRouteNames {
  MainStack = 'MainStack',
  RefillBattery = 'RefillBattery',
  Receive = 'Receive',
  Send = 'Send',
  ChooseCountry = 'ChooseCountry',
  ScanQR = 'ScanQR',
  RequireWalletModal = 'RequireWalletModal',
  NFTSend = 'NFTSend',
  BatterySend = 'BatterySend',
  Subscription = 'Subscription',
  BuyFiat = 'BuyFiat',
  ModalContainer = 'ModalContainer',
  Invoice = 'Invoice',
  AccessConfirmation = 'AccessConfirmation',
  MainAccessConfirmation = 'MainAccessConfirmation',
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
  AddWatchOnlyStack = 'AddWatchOnlyStack',
  MigrationStack = 'MigrationStack',
  Tabs = 'Tabs',
  Wallet = 'Wallet',
  Staking = 'Staking',
  StakingPools = 'StakingPools',
  StakingPoolDetails = 'StakingPoolDetails',
  Subscriptions = 'Subscriptions',
  DeleteAccountDone = 'DeleteAccountDone',
  DevStack = 'DevStack',
  Jetton = 'Jetton',
  Vouchers = 'Vouchers',
  ManageTokens = 'ManageTokens',
  AddressUpdateInfo = 'AddressUpdateInfo',
  Inscription = 'Inscription',
  HoldersWebView = 'HoldersWebView',
  ChangePin = 'ChangePin',
  ResetPin = 'ResetPin',
  ChangePinBiometry = 'ChangePinBiometry',
  Backup = 'Backup',
  BackupPhrase = 'BackupPhrase',
  BackupCheckPhrase = 'BackupCheckPhrase',
  Settings = 'SettingsStack',
}

export enum TabsStackRouteNames {
  Balances = 'Balances',
  BrowserStack = 'BrowserStack',
  Collectibles = 'Collectibles',
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
  Language = 'Language',
  Backup = 'Backup',
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
