import { AccountStatus, TonAPI } from '@tonkeeper/core/src/TonAPI';
import { TonRawAddress, WalletConfig, WalletContractVersion } from '../WalletTypes';
import { Storage } from '@tonkeeper/core/src/declarations/Storage';
import { AmountFormatter } from '@tonkeeper/core/src/utils/AmountFormatter';
import { State } from '@tonkeeper/core/src/utils/State';
import BigNumber from 'bignumber.js';
import { fromNano } from '@ton/core';

export interface BalancesState {
  isReloading: boolean;
  isLoading: boolean;
  ton: string;
  tonLocked: string;
  tonRestricted: string;
  status?: AccountStatus;
}

export class BalancesManager {
  static readonly INITIAL_STATE: BalancesState = {
    isReloading: false,
    isLoading: false,
    ton: '0',
    tonLocked: '0',
    tonRestricted: '0',
  };

  public state = new State<BalancesState>(BalancesManager.INITIAL_STATE);

  constructor(
    private persistPath: string,
    private tonRawAddress: TonRawAddress,
    private walletConfig: WalletConfig,
    private tonapi: TonAPI,
    private storage: Storage,
  ) {
    this.state.persist({
      partialize: ({ ton, tonLocked, tonRestricted }) => ({
        ton,
        tonLocked,
        tonRestricted,
      }),
      storage: this.storage,
      key: `${this.persistPath}/balances`,
    });
  }

  private get isLockup() {
    return this.walletConfig.version === WalletContractVersion.LockupV1;
  }

  // [ton_balance, ton_restricted, ton_locked]
  public async getLockupBalances() {
    try {
      if (this.walletConfig.version !== WalletContractVersion.LockupV1) {
        return ['0', '0', '0'];
      }

      const data = await this.tonapi.blockchain.execGetMethodForBlockchainAccount({
        accountId: this.tonRawAddress,
        methodName: 'get_balances',
      });

      const { ton_balance, total_restricted_value, total_locked_value } = data.decoded;

      // TODO: should return balances in nanocoins
      return [
        new BigNumber(ton_balance)
          .minus(total_restricted_value)
          .minus(total_locked_value)
          .toString(),
        total_restricted_value,
        total_locked_value,
      ].map(fromNano);
    } catch (e) {
      if (e?.response?.status === 404) {
        return ['0', '0', '0'];
      }

      throw e;
    }
  }

  public async load() {
    try {
      this.state.set({ isLoading: true });

      if (this.isLockup) {
        const [ton, tonRestricted, tonLocked] = await this.getLockupBalances();

        this.state.set({ isLoading: false, ton, tonLocked, tonRestricted });
        return this.state.data;
      }

      const account = await this.tonapi.accounts.getAccount(this.tonRawAddress);

      this.state.set({
        isLoading: false,
        ton: AmountFormatter.fromNanoStatic(account.balance),
        status: account.status,
      });

      return this.state.data;
    } catch (e) {
      this.state.set({
        isLoading: false,
      });

      throw e;
    }
  }

  public async reload() {
    this.state.set({ isReloading: true });
    await this.load();
    this.state.set({ isReloading: false });
    return this.state.data;
  }

  public async rehydrate() {
    return this.state.rehydrate();
  }
}
