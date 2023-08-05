import { Vault } from './Vault';

enum Network {
  mainnet = -239,
  testnet = -3,
}

enum WalletKind {
  Regular,
  Lockup,
  WatchOnly,
}

type WalletIdentity = {
  network: Network;
  kind: WalletKind;
  id: () => string;
};

enum Currency {
  USD = 'USD',
}

enum WalletContractVersion {
  v4R1 = 'v3R2',
  v3R2 = 'v3R2',
  v4R2 = 'v4R2',
  NA = 'NA',
}

type WalletInfo = {
  identity: Pick<WalletIdentity, 'network' | 'kind'>;
  currency: Currency;
  label: string;
};

export class Wallet {
  public identity: WalletIdentity | null = null;

  // public current = null;

  constructor(private vault: Vault) {}

  public async create({ name, passcode }: { passcode: string; name?: string }) {}

  public async import({
    words,
    passcode,
    name,
  }: {
    passcode: string;
    words: string;
    name: string;
  }) {

  }

  public async enableBiometry() {

  }

  public async disableBiometry() {

  }

  public async getPrivateKey(): Promise<string> {
    if (false) {
      return this.vault.exportWithBiometry('');
    } else {
      return this.vault.exportWithPasscode('');
    }
  }
}
