import { SetupWalletStackRouteNames } from '../navigationNames';

export type SetupWalletStackParamList = {
  [SetupWalletStackRouteNames.CreateWallet]: {};
  [SetupWalletStackRouteNames.SecretWords]: {};
  [SetupWalletStackRouteNames.CheckSecretWords]: {};
  [SetupWalletStackRouteNames.SetupCreatePin]: {};
  [SetupWalletStackRouteNames.SetupBiometry]: {
    pin: string;
  };
  [SetupWalletStackRouteNames.SetupNotifications]: {},
  [SetupWalletStackRouteNames.SetupWalletDone]: {};
};
