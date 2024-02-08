import { TonAPI } from '@tonkeeper/core/src/TonAPI';
import { TonRawAddress } from '../WalletTypes';
import { Storage } from '@tonkeeper/core/src/declarations/Storage';
import { AddressesByVersion } from '@tonkeeper/core/src/formatters/Address';
import { AmountFormatter } from '@tonkeeper/core/src/utils/AmountFormatter';
import { State } from '@tonkeeper/core/src/utils/State';

export interface OldWalletBalance {
  version: string;
  balance: string;
}

export interface BalancesState {
  isReloading: boolean;
  isLoading: boolean;
  ton: string;
  tonOldBalances: OldWalletBalance[];
}

export class BalancesManager {
  static readonly INITIAL_STATE: BalancesState = {
    isReloading: false,
    isLoading: false,
    ton: '0',
    tonOldBalances: [],
  };

  public state = new State<BalancesState>(BalancesManager.INITIAL_STATE);

  constructor(
    private tonRawAddress: TonRawAddress,
    private tonAllAddresses: AddressesByVersion,
    private isLockup: boolean,
    private tonapi: TonAPI,
    private storage: Storage,
  ) {
    this.state.persist({
      partialize: ({ ton, tonOldBalances }) => ({ ton, tonOldBalances }),
      storage: this.storage,
      key: `${this.tonRawAddress}/balances`,
    });
  }

  public async getLockupBalances() {
    // MULTIWALLET TODO
  }

  public async load() {
    try {
      this.state.set({ isLoading: true });
      const account = await this.tonapi.accounts.getAccount(this.tonRawAddress);

      this.state.set({
        isLoading: false,
        ton: AmountFormatter.fromNanoStatic(account.balance),
      });

      this.loadOldBalances();
    } catch (e) {
      this.state.set(({ ton }) => ({
        isLoading: false,
        ton: e?.response?.status === 404 ? AmountFormatter.fromNanoStatic(0) : ton,
      }));
    }
  }

  private async loadOldBalances() {
    const currentIndex = Object.values(this.tonAllAddresses)
      .reverse()
      .findIndex((address) => address.raw === this.tonRawAddress);
    const versions = Object.keys(this.tonAllAddresses)
      .reverse()
      .slice(currentIndex + 1);

    const accounts = await Promise.all(
      versions.map((version) =>
        this.tonapi.accounts.getAccount(this.tonAllAddresses[version].raw),
      ),
    );

    const tonOldBalances = accounts
      .map((account, index) => ({
        balance: AmountFormatter.fromNanoStatic(account.balance),
        version: versions[index],
      }))
      .filter((item) => item.balance !== '0');

    this.state.set({ tonOldBalances });
  }

  public async reload() {
    this.state.set({ isReloading: true });
    await this.load();
    this.state.set({ isReloading: false });
  }

  public async rehydrate() {
    return this.state.rehydrate();
  }
}
