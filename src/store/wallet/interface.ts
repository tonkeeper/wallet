import { PayloadAction } from '@reduxjs/toolkit';
import { UnlockedVault, Wallet } from '$blockchain';
import { CryptoCurrency, SelectableVersion } from '$shared/constants';

export type OldWalletBalanceItem = {
  version: string;
  balance: string;
};

export interface WalletState {
  isLoaded: boolean;
  isRefreshing: boolean;
  generatedVault: UnlockedVault | null;
  version: SelectableVersion;
  wallet: Wallet | null;
  currencies: CryptoCurrency[];
  balances: { [index: string]: string };
  address: { [index: string]: string };
  oldWalletBalances: OldWalletBalanceItem[];
}

export type SetGeneratedVaultAction = PayloadAction<UnlockedVault>;
export type SetWalletAction = PayloadAction<Wallet>;
export type RestoreWalletAction = PayloadAction<{
  mnemonics: string;
  config: any;
  onDone: () => void;
  onFail: () => void;
}>;
export type TransferCoinsAction = PayloadAction<{
  currency: CryptoCurrency;
  address: string;
  amount: string;
}>;
export type SetAddressesAction = PayloadAction<{ [index: string]: string }>;
export type ConfirmSendCoinsAction = PayloadAction<{
  currency: CryptoCurrency;
  amount: string;
  address: string;
  comment?: string;
  onEnd?: () => void;
  onNext: (info: { fee: string; isInactive: boolean }) => void;
  isJetton?: boolean;
  decimals?: number;
  jettonWalletAddress?: string;
}>;
export type SendCoinsAction = PayloadAction<{
  currency: CryptoCurrency;
  amount: string;
  address: string;
  comment: string;
  isJetton?: boolean;
  jettonWalletAddress?: string;
  isSendAll?: boolean;
  decimals?: number;
  onDone: () => void;
  onFail: () => void;
}>;
export type ChangeBalanceAndReloadAction = PayloadAction<{
  currency: CryptoCurrency;
  amount: string;
}>;
export type SetCurrenciesAction = PayloadAction<CryptoCurrency[]>;
export type CreateWalletAction = PayloadAction<{
  onDone: () => void;
  onFail?: () => void;
  pin?: string | null;
  fromRestore?: boolean;
  isBiometryEnabled?: boolean;
}>;
export type RefreshBalancesPageAction = PayloadAction<boolean | undefined>;
export type ReloadBalanceTwiceAction = PayloadAction<CryptoCurrency>;
export type MigrateAction = PayloadAction<{
  onDone: () => void;
  onFail: () => void;
  oldAddress: string;
  newAddress: string;
  fromVersion?: string;
}>;

export type WaitMigrationAction = PayloadAction<{
  onDone: () => void;
  onFail: () => void;
}>;
export type SetBalancesAction = PayloadAction<any>;
export type DeployWalletAction = PayloadAction<{
  onDone: () => void;
  onFail: () => void;
}>;
export type SetOldWalletBalanceAction = PayloadAction<OldWalletBalanceItem[]>;
export type OpenMigrationAction = PayloadAction<
  { isTransfer?: boolean; fromVersion?: string } | undefined
>;
export type ToggleBiometryAction = PayloadAction<{
  isEnabled: boolean;
  onFail: () => void;
}>;
export type ChangePinAction = PayloadAction<{
  vault: UnlockedVault;
  pin: string;
}>;

export type WalletGetUnlockedVaultAction = PayloadAction<
  | {
      onDone?: (vault: UnlockedVault) => void;
      onFail?: (err: any) => void;
    }
  | undefined
>;
