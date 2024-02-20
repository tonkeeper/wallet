import { ImportWalletInfo } from '$wallet/WalletTypes';

export enum ImportWalletStackRouteNames {
  ImportWallet = 'ImportWallet',
  ChooseWallets = 'ChooseWallets',
  CreatePasscode = 'ImportWalletPasscode',
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
  [ImportWalletStackRouteNames.Notifications]: {
    identifiers: string[];
  };
};
