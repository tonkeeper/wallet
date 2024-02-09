import { AuthenticationType } from 'expo-local-authentication';

export enum ImportWalletStackRouteNames {
  ImportWallet = 'ImportWallet',
  CreatePasscode = 'ImportWalletPasscode',
  Biometry = 'ImportWalletBiometry',
  Notifications = 'ImportWalletNotifications',
}

export type ImportWalletStackParamList = {
  [ImportWalletStackRouteNames.ImportWallet]: {
    testnet?: boolean;
  };
  [ImportWalletStackRouteNames.CreatePasscode]: {};
  [ImportWalletStackRouteNames.Biometry]: {
    pin: string;
    biometryType: AuthenticationType;
  };
  [ImportWalletStackRouteNames.Notifications]: {};
};
