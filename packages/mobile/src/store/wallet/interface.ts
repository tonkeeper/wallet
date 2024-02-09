import { PayloadAction } from '@reduxjs/toolkit';
import { UnlockedVault, Wallet } from '$blockchain';
import { CryptoCurrency, SelectableVersion } from '$shared/constants';
import { InsufficientFundsParams } from '$core/ModalContainer/InsufficientFunds/InsufficientFunds';
import { CurrencyAdditionalParams, TokenType } from '$core/Send/Send.interface';
import { WalletContractVersion } from '$wallet/WalletTypes';

export type OldWalletBalanceItem = {
  version: string;
  balance: string;
};

export type Address = {
  friendlyAddress: string;
  rawAddress: string;
  version: string;
};

export interface WalletState {
  isRefreshing: boolean;
  generatedVault: UnlockedVault | null;
  version: SelectableVersion;
  wallet: Wallet | null;
  readableAddress: Address | null;
  currencies: CryptoCurrency[];
  balances: { [index: string]: string };
  updatedAt: number | null;
  address: { [index: string]: string };
  oldWalletBalances: OldWalletBalanceItem[];
}

export type SetGeneratedVaultAction = PayloadAction<UnlockedVault>;
export type SetWalletAction = PayloadAction<Wallet>;
export type SetReadableAddress = PayloadAction<Address | null>;

export type RestoreWalletAction = PayloadAction<{
  mnemonic: string;
  versions: WalletContractVersion[];
  config: any;
  onDone: () => void;
  onFail: () => void;
}>;
export type SetAddressesAction = PayloadAction<{ [index: string]: string }>;
export type ConfirmSendCoinsAction = PayloadAction<{
  currency: string;
  amount: string;
  address: string;
  comment?: string;
  isCommentEncrypted?: boolean;
  onEnd?: () => void;
  onInsufficientFunds?: (params: InsufficientFundsParams) => void;
  onNext: (info: { fee: string; isInactive: boolean; isBattery: boolean }) => void;
  tokenType?: TokenType;
  isSendAll?: boolean;
  decimals?: number;
  jettonWalletAddress?: string;
  currencyAdditionalParams?: CurrencyAdditionalParams;
}>;
export type SendCoinsAction = PayloadAction<{
  fee: string;
  currency: CryptoCurrency;
  amount: string;
  address: string;
  comment: string;
  isCommentEncrypted?: boolean;
  tokenType?: TokenType;
  jettonWalletAddress?: string;
  isSendAll?: boolean;
  decimals?: number;
  onDone: () => void;
  onFail: () => void;
  sendWithBattery?: boolean;
  currencyAdditionalParams?: CurrencyAdditionalParams;
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
  isTestnet?: boolean;
  fromRestore?: boolean;
  isBiometryEnabled?: boolean;
}>;
export type ReloadBalanceTwiceAction = PayloadAction<CryptoCurrency>;
export type SetBalancesAction = PayloadAction<any>;
export type SetUpdatedAtAction = PayloadAction<number | null>;
export type DeployWalletAction = PayloadAction<{
  onDone: () => void;
  onFail: () => void;
}>;
export type SetOldWalletBalanceAction = PayloadAction<OldWalletBalanceItem[]>;
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
