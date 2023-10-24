import { NavigationProp } from '@react-navigation/native';

export enum AppStackRouteNames {
  Intro = 'Intro',
  MainStack = 'MainStack',
  Receive = 'Receive',
  Send = 'Send',
  ChooseCountry = 'ChooseCountry',
  ScanQR = 'ScanQR',
  RequireWalletModal = 'RequireWalletModal',
  Subscription = 'Subscription',
  SetupWalletStack = 'SetupWalletStack',
  BuyFiat = 'BuyFiat',
  ModalContainer = 'ModalContainer',
  Invoice = 'Invoice',
  Migration = 'Migration',
  AccessConfirmation = 'AccessConfirmation',
  MainAccessConfirmation = 'MainAccessConfirmation',
  ChangePin = 'ChangePin',
  ResetPin = 'AppResetPin',
  SecurityMigration = 'SecurityMigration',
  NFT = 'NFT',
  WebView = 'WebView',
  DevStack = 'DevStack',
  DAppsSearch = 'DAppsSearch',
  DAppBrowser = 'DAppBrowser',
  StakingSend = 'StakingSend',
  Swap = 'Swap',
}

export enum MainStackRouteNames {
  Tabs = 'Tabs',
  Wallet = 'Wallet',
  Staking = 'Staking',
  StakingPools = 'StakingPools',
  StakingPoolDetails = 'StakingPoolDetails',
  ImportWallet = 'ImportWallet',
  Subscriptions = 'Subscriptions',
  BackupWords = 'BackupWords',
  CreatePin = 'CreatePin',
  SetupBiometry = 'ImportSetupBiometry',
  ImportWalletDone = 'ImportWalletDone',
  DeleteAccountDone = 'DeleteAccountDone',
  DevStack = 'DevStack',
  SetupNotifications = 'ImportSetupNotifications',
  Jetton = 'Jetton',
  JettonsList = 'JettonsList',
  EditConfig = 'EditConfig',
  ManageTokens = 'ManageTokens',
  AddressUpdateInfo = 'AddressUpdateInfo',
}

export enum TabsStackRouteNames {
  Balances = 'Balances',
  NFT = 'TabNFT',
  BrowserStack = 'BrowserStack',
  SettingsStack = 'SettingsStack',
  Activity = 'Activity',
}

export enum SetupWalletStackRouteNames {
  CreateWallet = 'CreateWallet',
  SecretWords = 'SecretWords',
  CheckSecretWords = 'CheckSecretWords',
  SetupCreatePin = 'SetupCreatePin',
  SetupBiometry = 'SetupBiometry',
  SetupWalletDone = 'SetupWalletDone',
  SetupNotifications = 'SetupNotifications',
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
  JettonsList = 'JettonsList',
  SecurityMigration = 'SettingsSecurityMigration',
  LegalDocuments = 'LegalDocuments',
  FontLicense = 'FontLicense',
  Notifications = 'Notifications',
  ChooseCurrency = 'ChooseCurrency',
}

export enum ActivityStackRouteNames {
  Activity = 'Settings',
  NotificationsActivity = 'NotificationsActivity',
  Notifications = 'Notifications',
}

export enum ResetPinStackRouteNames {
  ResetPin = 'ResetPin',
  SetupBiometry = 'ResetPinSetupBiometry',
}

export enum SecurityMigrationStackRouteNames {
  SecurityMigration = 'SecurityMigration',
  SetupBiometry = 'SecurityMigrationSetupBiometry',
  AccessConfirmation = 'SecurityMigrationAccessConfirmation',
  SetupWalletDone = 'SecurityMigrationSetupWalletDone',
  CreatePin = 'SecurityMigrationCreatePin',
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
  | `${SetupWalletStackRouteNames}`
  | `${SettingsStackRouteNames}`
  | `${ResetPinStackRouteNames}`
  | `${SecurityMigrationStackRouteNames}`
  | `${DevComponents}`;

type ScreenProps = { [key in ScreenNames]: any };

export type NavProp = NavigationProp<ScreenProps>;
