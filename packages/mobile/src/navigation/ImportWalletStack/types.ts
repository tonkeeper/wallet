import { ImportWalletInfo } from '$wallet/WalletTypes';
import { AuthenticationType } from 'expo-local-authentication';

export enum ImportWalletStackRouteNames {
  ImportWallet = 'ImportWallet',
  ChooseWallets = 'ChooseWallets',
  CreatePasscode = 'ImportWalletPasscode',
  Biometry = 'ImportWalletBiometry',
  Notifications = 'ImportWalletNotifications',
}

export type ImportWalletStackParamList = {
  [ImportWalletStackRouteNames.ImportWallet]: {
    testnet?: boolean;
  };
  [ImportWalletStackRouteNames.ChooseWallets]: {
    walletsInfo: ImportWalletInfo[];
    mnemonic: string;
    isTestnet: boolean;
    lockupConfig: {};
    isMigration?: boolean;
  };
  [ImportWalletStackRouteNames.CreatePasscode]: {};
  [ImportWalletStackRouteNames.Biometry]: {
    pin: string;
    biometryType: AuthenticationType;
  };
  [ImportWalletStackRouteNames.Notifications]: {
    identifiers: string[];
  };
};
