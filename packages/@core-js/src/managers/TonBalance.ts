import { Storage } from '../declarations/Storage';
import { TonRawAddress, WalletContractVersion } from '../WalletTypes';
import { State } from '../utils/State';
import { TonAPI } from '../TonAPI';

type VersionsByAddress = {
  [key: string]: TonRawAddress;
};

export type TonBalanceState = {
  [key in WalletContractVersion]: number;
};

export class TonBalance {
  private addressesMap: VersionsByAddress;
  public state = new State<TonBalanceState>({
    v4R2: 0,
    v4R1: 0,
    v3R2: 0,
    v3R1: 0,
  });

  constructor(
    private addresses: {
      [key: string]: { friendly: string; raw: string; version: string };
    },
    private tonapi: TonAPI,
    private storage: Storage,
  ) {
    this.addressesMap = Object.keys(addresses).reduce((map, version) => {
      map[this.addresses[version].raw] = version;
      return map;
    }, {});

    this.state.persist({
      partialize: (state) => state,
      storage: this.storage,
      key: 'tonBalances',
    });
  }

  public async load() {
    const account_ids = Object.keys(this.addressesMap);
    const data = await this.tonapi.accounts.getAccounts({ account_ids });

    const balance = data.accounts.reduce((versions, account) => {
      versions[this.addressesMap[account.address]] = account.balance;
      return versions;
    }, {});

    this.state.set(balance);
  }

  public preload() {
    this.load();
  }
}
