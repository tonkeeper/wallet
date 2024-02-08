export type PasscodeShowOptions = {
  onLogout?: () => void;
  onPressBiometry?: () => void;
  onEnter: (passcode: string) => Promise<void>;
};

export interface PasscodeController {
  show: (options: PasscodeShowOptions) => void;
}

export declare class Vault {
  public setupBiometry(passcode: string): Promise<void>;
  public removeBiometry(): Promise<void>;
  public exportWithBiometry(pubkey: string): Promise<string>;
  public exportWithPasscode(pubkey: string, passcode: string): Promise<string>;
  public changePasscode(passcode: string, newPasscode: string): Promise<void>;
  public remove(pubkey: string, passcode: string): Promise<void>;
  public import(mnemonic: string, passcode: string): Promise<string>;
  public destroy(): Promise<void>;
}
