import { DependencyPrototype } from './utils/prototype';
import { tk } from '$wallet';
import { BalancesState } from '$wallet/managers/BalancesManager';

export class TonBalancesDependency extends DependencyPrototype<
  BalancesState,
  Pick<BalancesState, 'ton' | 'tonLocked' | 'tonRestricted'>
> {
  constructor() {
    super(tk.wallet.balances.state, (state) => ({
      ton: state.ton,
      tonLocked: state.tonLocked,
      tonRestricted: state.tonRestricted,
    }));
  }

  setWallet(wallet) {
    this.dataProvider = wallet.balances.state;
    super.setWallet(wallet);
  }
}
