export type PasscodeShowOptions = {
  onLogout?: () => void;
  onPressBiometry?: () => void;
  onEnter: (passcode: string) => Promise<void>;
};

export interface PasscodeController {
  show: (options: PasscodeShowOptions) => void;
}

export declare class Vault {
  public saveWithBiometry(pubkey: string, words: string[]): Promise<boolean>;
  public exportWithBiometry(pubkey: string): Promise<string>;
  public removeBiometry(pubkey: string): Promise<boolean>;
  public exportWithPasscode(pubkey: string): Promise<string>;
  public removePasscode(pubkey: string): Promise<boolean>;
  public saveWithPasscode(
    pubkey: string,
    words: string[],
    passcode: string,
  ): Promise<boolean>;
}
