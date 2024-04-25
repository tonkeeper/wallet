import { DependencyPrototype } from './utils/prototype';
import { tk } from '$wallet';
import { BalancesState } from '$wallet/managers/BalancesManager';

export enum TonBalanceType {
  Liquid = 'Liquid',
  Locked = 'Locked',
  Restricted = 'Restricted',
}

export type TonBalance = {
  type: TonBalanceType;
  balance: string;
};

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

  get balances() {
    const balances: TonBalance[] = [
      { type: TonBalanceType.Liquid, balance: this.state.ton },
    ];

    if (this.wallet.isLockup) {
      balances.push(
        { type: TonBalanceType.Locked, balance: this.state.tonLocked },
        {
          type: TonBalanceType.Restricted,
          balance: this.state.tonRestricted,
        },
      );
    }

    return balances;
  }
}
