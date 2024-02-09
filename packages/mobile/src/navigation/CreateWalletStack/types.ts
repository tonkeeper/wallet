import { AuthenticationType } from 'expo-local-authentication';

export enum CreateWalletStackRouteNames {
  CreateWallet = 'CreateWallet',
  SecretWords = 'CreateWalletSecretWords',
  CheckSecretWords = 'CreateWalletCheckSecretWords',
  CreatePasscode = 'CreateWalletPasscode',
  Biometry = 'CreateWalletBiometry',
  Notifications = 'CreateWalletNotifications',
}

export type CreateWalletStackParamList = {
  [CreateWalletStackRouteNames.CreateWallet]: {};
  [CreateWalletStackRouteNames.SecretWords]: {};
  [CreateWalletStackRouteNames.CheckSecretWords]: {};
  [CreateWalletStackRouteNames.CreatePasscode]: {};
  [CreateWalletStackRouteNames.Biometry]: {
    pin: string;
    biometryType: AuthenticationType;
  };
  [CreateWalletStackRouteNames.Notifications]: {};
};
