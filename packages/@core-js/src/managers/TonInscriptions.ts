import { InscriptionBalance, TonAPI } from '../TonAPI';
import { Storage } from '../declarations/Storage';
import { State } from '../utils/State';

type TonInscriptionsState = {
  items: InscriptionBalance[];
  isLoading: boolean;
};

export class TonInscriptions {
  public state = new State<TonInscriptionsState>({
    isLoading: false,
    items: [],
  });

  constructor(
    private tonAddress: string,
    private tonapi: TonAPI,
    private storage: Storage,
  ) {
    this.state.persist({
      partialize: ({ items }) => ({ items }),
      storage: this.storage,
      key: 'inscriptions',
    });
  }

  public async getInscriptions() {
    try {
      this.state.set({ isLoading: true });
      const data = await this.tonapi.experimental.getAccountInscriptions({
        accountId: this.tonAddress,
      });
      this.state.set({ items: data.inscriptions });
    } catch (err) {
      this.state.set({ isLoading: false });
    }
  }

  public async preload() {
    this.getInscriptions();
  }
}
