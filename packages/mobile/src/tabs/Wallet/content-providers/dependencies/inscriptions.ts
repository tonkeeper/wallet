import { DependencyPrototype } from './utils/prototype';

import { TonInscriptionsState } from '$wallet/managers/TonInscriptions';
import { Wallet } from '$wallet/Wallet';

export class InscriptionsDependency extends DependencyPrototype<
  TonInscriptionsState,
  TonInscriptionsState['items']
> {
  constructor(wallet: Wallet) {
    super(wallet.tonInscriptions.state, (state) => state.items);
  }
}
