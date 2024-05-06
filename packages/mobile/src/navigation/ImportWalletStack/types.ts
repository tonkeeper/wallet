import { ImportWalletInfo, WalletContractVersion } from '$wallet/WalletTypes';

export enum ImportWalletStackRouteNames {
  ImportWallet = 'ImportWallet',
  PairSignerScreen = 'PairSignerScreen',
  ChooseWallets = 'ChooseWallets',
  CreatePasscode = 'ImportWalletPasscode',
  Notifications = 'ImportWalletNotifications',
}

export type ImportWalletStackParamList = {
  [ImportWalletStackRouteNames.PairSignerScreen]: {};
  [ImportWalletStackRouteNames.ImportWallet]: {
    testnet?: boolean;
  };
  [ImportWalletStackRouteNames.ChooseWallets]: {
    walletsInfo: ImportWalletInfo[];
    mnemonic: string;
    isTestnet: boolean;
    lockupConfig: {};
    isMigration?: boolean;
    onDone?: (selectedVersions: WalletContractVersion[]) => Promise<void>;
  };
  [ImportWalletStackRouteNames.CreatePasscode]: {};
  [ImportWalletStackRouteNames.Notifications]: {
    identifiers: string[];
  };
};
