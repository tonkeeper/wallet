import nacl from 'tweetnacl';

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
  public exportPasscodeWithBiometry(): Promise<string>;
  public exportWithPasscode(identifier: string, passcode: string): Promise<string>;
  public changePasscode(passcode: string, newPasscode: string): Promise<void>;
  public remove(identifier: string, passcode: string): Promise<void>;
  public import(
    identifier: string,
    mnemonic: string,
    passcode: string,
  ): Promise<nacl.SignKeyPair>;
  public destroy(): Promise<void>;
}
