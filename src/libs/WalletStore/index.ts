import { NativeModules } from 'react-native';

type PublicKey = string;
type SecretKey = string;

interface WalletInfo {
  pubkey: PublicKey,
  label: string,
}

type WalletStore = {
  validate(words: string[]): Promise<boolean>;
  listWallets(): Promise<WalletInfo[]>;
  importWalletWithPasscode(words: string[], passcode: string): Promise<WalletInfo>
  importWalletWithBiometry(words: string[]): Promise<WalletInfo>;
  getWallet(pk: PublicKey): Promise<WalletInfo>;
  getWalletByAddress(address: string): Promise<WalletInfo>;
  updateWallet(pk: PublicKey, label: string): Promise<undefined>;
  exportWithPasscode(pk: PublicKey, passcode: string): Promise<SecretKey>;
  exportWithBiometry(pk: PublicKey): Promise<SecretKey>;
  backupWithPasscode(pk: PublicKey, passcode: string): Promise<string[]>;
  backupWithBiometry(pk: PublicKey): Promise<string[]>;
  currentWalletInfo(): Promise<WalletInfo>;
  setCurrentWallet(pk: PublicKey): Promise<boolean>;
  removeWallets(): Promise<undefined>;
  removeWallet(pk: PublicKey): Promise<undefined>;
}

export const WalletStore: WalletStore = NativeModules.WalletStore;
