import { TonAPI } from '@tonkeeper/core/src/TonAPI';
import {
  TonRawAddress,
  WalletConfig,
  WalletContractVersion,
  WalletNetwork,
} from '../WalletTypes';
import { Storage } from '@tonkeeper/core/src/declarations/Storage';
import { AmountFormatter } from '@tonkeeper/core/src/utils/AmountFormatter';
import { State } from '@tonkeeper/core/src/utils/State';
import TonWeb from 'tonweb';
import { config } from '$config';
import BigNumber from 'bignumber.js';
import { LockupWalletV1 } from 'tonweb/dist/types/contract/lockup/lockup-wallet-v1';

export interface BalancesState {
  isReloading: boolean;
  isLoading: boolean;
  ton: string;
  tonLocked: string;
  tonRestricted: string;
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

  public async getLockupBalances() {
    try {
      const isTestnet = this.walletConfig.network === WalletNetwork.testnet;

      const tonweb = new TonWeb(
        new TonWeb.HttpProvider(config.get('tonEndpoint', isTestnet), {
          apiKey: config.get('tonEndpointAPIKey', isTestnet),
        }),
      );

      const tonPublicKey = Uint8Array.from(Buffer.from(this.walletConfig.pubkey, 'hex'));

      const tonWallet: LockupWalletV1 = new tonweb.lockupWallet.all[
        this.walletConfig.version
      ](tonweb.provider, {
        publicKey: tonPublicKey,
        wc: this.walletConfig.workchain ?? 0,
        config: {
          wallet_type: this.walletConfig.version,
          config_public_key: this.walletConfig.configPubKey,
          allowed_destinations: this.walletConfig.allowedDestinations,
        },
      });

      const balances = await tonWallet.getBalances();
      const result = balances.map((item: number) =>
        AmountFormatter.fromNanoStatic(item.toString()),
      );
      result[0] = new BigNumber(result[0]).minus(result[1]).minus(result[2]).toString();

      return result;
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
        const [ton, tonLocked, tonRestricted] = await this.getLockupBalances();

        this.state.set({ isLoading: false, ton, tonLocked, tonRestricted });
        return this.state.data;
      }

      const account = await this.tonapi.accounts.getAccount(this.tonRawAddress);

      this.state.set({
        isLoading: false,
        ton: AmountFormatter.fromNanoStatic(account.balance),
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
  }

  public async rehydrate() {
    return this.state.rehydrate();
  }
}
