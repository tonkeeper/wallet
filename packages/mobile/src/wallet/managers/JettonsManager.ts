import { JettonVerificationType, TonAPI } from '@tonkeeper/core/src/TonAPI';
import { Storage } from '@tonkeeper/core/src/declarations/Storage';
import { TokenRate, TonRawAddress } from '../WalletTypes';
import { Logger } from '@tonkeeper/core/src/utils/Logger';
import { State } from '@tonkeeper/core/src/utils/State';
import { JettonBalanceModel } from '../models/JettonBalanceModel';
import { Address } from '@tonkeeper/core/src/formatters/Address';
import { TokenApprovalManager } from './TokenApprovalManager';
import { TonPriceManager } from './TonPriceManager';
import { JettonMasterMethods, TETHER_JETTON_MASTER } from '@tonkeeper/core';
import { compareAddresses } from '$utils/address';

export type JettonsState = {
  jettonBalances: JettonBalanceModel[];
  jettonRates: Record<string, TokenRate>;
  error?: string | null;
  isReloading: boolean;
  isLoading: boolean;
};

export class JettonsManager {
  static readonly INITIAL_STATE: JettonsState = {
    isReloading: false,
    isLoading: false,
    jettonBalances: [],
    jettonRates: {},
    error: null,
  };

  public state = new State<JettonsState>(JettonsManager.INITIAL_STATE);

  constructor(
    private persistPath: string,
    private tonRawAddress: TonRawAddress,
    private tonPrice: TonPriceManager,
    private tokenApproval: TokenApprovalManager,
    private tonapi: TonAPI,
    private storage: Storage,
  ) {
    this.state.persist({
      partialize: ({ jettonBalances, jettonRates }) => ({ jettonBalances, jettonRates }),
      storage: this.storage,
      key: `${this.persistPath}/jettons`,
    });
  }

  public async loadRate(address: string) {
    const jettonAddress = new Address(address).toRaw();
    const currency = this.tonPrice.state.data.currency.toUpperCase();

    try {
      const response = await this.tonapi.rates.getRates({
        tokens: jettonAddress,
        currencies: ['TON', 'USD', currency].join(','),
      });

      const rate = response.rates[jettonAddress];

      this.state.set({
        ...this.state.data.jettonRates,
        [jettonAddress]: {
          fiat: rate?.prices![currency],
          usd: rate?.prices!.USD,
          ton: rate?.prices!.TON,
          diff_24h: rate?.diff_24h![currency],
        },
      });
    } catch {}
  }

  public async load() {
    try {
      this.state.set({ isLoading: true, error: null });

      const currency = this.tonPrice.state.data.currency.toUpperCase();

      const accountJettons = await this.tonapi.accounts.getAccountJettonsBalances({
        accountId: this.tonRawAddress,
        currencies: ['TON', 'USD', currency].join(','),
      });

      const tetherIdx = accountJettons.balances.findIndex((bal) =>
        compareAddresses(bal.jetton.address, TETHER_JETTON_MASTER),
      );

      if (tetherIdx === -1) {
        const tether = await this.tonapi.jettons.getJettonInfo(TETHER_JETTON_MASTER);
        const rate = await this.tonapi.rates.getRates({
          tokens: TETHER_JETTON_MASTER,
          currencies: ['TON', 'USD', currency].join(','),
        });

        const walletAddress =
          await this.tonapi.blockchain.execGetMethodForBlockchainAccount({
            accountId: TETHER_JETTON_MASTER,
            methodName: JettonMasterMethods.GetWalletAddress,
            args: [this.tonRawAddress],
          });

        accountJettons.balances.push({
          jetton: {
            ...tether.metadata,
            decimals: Number(tether.metadata.decimals),
            verification: JettonVerificationType.Whitelist,
            image: tether.metadata.image ?? '',
          },
          price: rate.rates[TETHER_JETTON_MASTER],
          balance: '0',
          wallet_address: {
            address: walletAddress.decoded.jetton_wallet_address,
            is_wallet: false,
            is_scam: true,
          },
        });
      }

      const jettonBalances = accountJettons.balances
        .filter((item) => {
          return (
            item.jetton.address === TETHER_JETTON_MASTER ||
            item.balance !== '0' ||
            (item.lock && item.lock.amount !== '0')
          );
        })
        .map((item) => {
          return new JettonBalanceModel(item);
        });

      // Move Token to pending if name or symbol changed
      const jettonBalancesMap = new Map(jettonBalances.map((b) => [b.jettonAddress, b]));

      this.state.data.jettonBalances.forEach((balance) => {
        const newBalance = jettonBalancesMap.get(balance.jettonAddress);
        if (
          newBalance &&
          (balance.metadata.name !== newBalance.metadata.name ||
            balance.metadata.symbol !== newBalance.metadata.symbol)
        ) {
          this.tokenApproval.removeTokenStatus(balance.jettonAddress);
        }
      });

      const jettonRates = accountJettons.balances.reduce<JettonsState['jettonRates']>(
        (acc, item) => {
          if (!item.price) {
            return acc;
          }

          return {
            ...acc,
            [item.jetton.address]: {
              fiat: item.price?.prices![currency],
              usd: item.price?.prices!.USD,
              ton: item.price?.prices!.TON,
              diff_24h: item.price?.diff_24h![currency],
            },
          };
        },
        {},
      );

      this.state.set({
        isLoading: false,
        jettonBalances,
        jettonRates: { ...this.state.data.jettonRates, ...jettonRates },
      });
    } catch (err) {
      const message = `[JettonsManager]: ${Logger.getErrorMessage(err)}`;
      console.log(message);
      this.state.set({
        isLoading: false,
        error: message,
      });
    }
  }

  public getLoadedJetton(jettonAddress: string) {
    return this.state.data.jettonBalances.find((item) =>
      Address.compare(item.jettonAddress, jettonAddress),
    );
  }

  public async rehydrate() {
    return this.state.rehydrate();
  }

  public async reload() {
    this.state.set({ isReloading: true });
    await this.load();
    this.state.set({ isReloading: false });
  }

  public reset() {
    this.state.clear();
    this.state.clearPersist();
  }
}
