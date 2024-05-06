import { PayloadAction } from '@reduxjs/toolkit';
import { UnlockedVault, Wallet } from '$blockchain';
import { CryptoCurrency } from '$shared/constants';
import { InsufficientFundsParams } from '$core/ModalContainer/InsufficientFunds/InsufficientFunds';
import { CurrencyAdditionalParams, TokenType } from '$core/Send/Send.interface';
import { WalletContractVersion } from '$wallet/WalletTypes';

export interface WalletState {
  generatedVault: UnlockedVault | null;
  wallet: Wallet | null;
  address: { [index: string]: string };
}

export type SetGeneratedVaultAction = PayloadAction<UnlockedVault>;
export type SetWalletAction = PayloadAction<Wallet>;

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
  encryptedCommentPrivateKey?: Uint8Array | null;
  tokenType?: TokenType;
  jettonWalletAddress?: string;
  isSendAll?: boolean;
  decimals?: number;
  onDone: () => void;
  onFail: (error?: Error) => void;
  sendWithBattery?: boolean;
  currencyAdditionalParams?: CurrencyAdditionalParams;
}>;
export type CreateWalletAction = PayloadAction<{
  onDone: (identifiers: string[]) => void;
  onFail?: () => void;
  pin?: string | null;
  isTestnet?: boolean;
  fromRestore?: boolean;
  isBiometryEnabled?: boolean;
}>;
export type DeployWalletAction = PayloadAction<{
  onDone: () => void;
  onFail: () => void;
}>;
export type ToggleBiometryAction = PayloadAction<{
  isEnabled: boolean;
  onFail: () => void;
}>;

export type WalletGetUnlockedVaultAction = PayloadAction<
  | {
      onDone?: (vault: UnlockedVault) => void;
      onFail?: (err: any) => void;
      walletIdentifier?: string;
    }
  | undefined
>;

export type CleanWalletAction = PayloadAction<{ cleanAll: boolean } | undefined>;
