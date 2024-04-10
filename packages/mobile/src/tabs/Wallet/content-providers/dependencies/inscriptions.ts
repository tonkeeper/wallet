import { DependencyPrototype } from './utils/prototype';
import { tk } from '$wallet';

import { TonInscriptionsState } from '$wallet/managers/TonInscriptions';

export class InscriptionsDependency extends DependencyPrototype<
  TonInscriptionsState,
  TonInscriptionsState['items']
> {
  constructor() {
    super(tk.wallet.tonInscriptions.state, (state) => state.items);
  }

  setWallet(wallet) {
    this.dataProvider = wallet.tonInscriptions.state;
    super.setWallet(wallet);
  }
}
