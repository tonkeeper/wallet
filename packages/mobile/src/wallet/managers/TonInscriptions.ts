import { InscriptionBalance, TonAPI } from '@tonkeeper/core/src/TonAPI';
import { Storage } from '@tonkeeper/core/src/declarations/Storage';
import { State } from '@tonkeeper/core/src/utils/State';

export type TonInscriptionsState = {
  items: InscriptionBalance[];
  isLoading: boolean;
};

export class TonInscriptions {
  public state = new State<TonInscriptionsState>({
    isLoading: false,
    items: [],
  });

  constructor(
    private persistPath: string,
    private tonRawAddress: string,
    private tonapi: TonAPI,
    private storage: Storage,
  ) {
    this.state.persist({
      partialize: ({ items }) => ({ items }),
      storage: this.storage,
      key: `${this.persistPath}/inscriptions`,
    });
  }

  public async rehydrate() {
    return this.state.rehydrate();
  }

  public async load() {
    try {
      this.state.set({ isLoading: true });
      const data = await this.tonapi.experimental.getAccountInscriptions({
        accountId: this.tonRawAddress,
      });
      this.state.set({
        items: data.inscriptions.filter((inscription) => inscription.balance !== '0'),
      });
    } catch (err) {
      this.state.set({ isLoading: false });
    }
  }
}
