import { ImportWalletInfo } from '$wallet/WalletTypes';

export enum MigrationStackRouteNames {
  Passcode = 'MigrationPasscode',
  ChooseWallets = 'MigrationChooseWallets',
}

export type MigrationStackParamList = {
  [MigrationStackRouteNames.Passcode]: {};
  [MigrationStackRouteNames.ChooseWallets]: {
    walletsInfo: ImportWalletInfo[];
    mnemonic: string;
    isTestnet: boolean;
    lockupConfig: {};
    isMigration?: boolean;
  };
};
