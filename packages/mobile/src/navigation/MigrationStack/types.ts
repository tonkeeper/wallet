import { ImportWalletInfo } from '$wallet/WalletTypes';

export enum MigrationStackRouteNames {
  Start = 'MigrationStartScreen',
  Passcode = 'MigrationPasscode',
  CreatePasscode = 'MigrationCreatePasscode',
  ChooseWallets = 'MigrationChooseWallets',
}

export type MigrationStackParamList = {
  [MigrationStackRouteNames.Start]: {};
  [MigrationStackRouteNames.Passcode]: {};
  [MigrationStackRouteNames.CreatePasscode]: {
    mnemonic: string;
  };
  [MigrationStackRouteNames.ChooseWallets]: {
    walletsInfo: ImportWalletInfo[];
    mnemonic: string;
    isTestnet: boolean;
    lockupConfig: {};
    isMigration?: boolean;
  };
};
