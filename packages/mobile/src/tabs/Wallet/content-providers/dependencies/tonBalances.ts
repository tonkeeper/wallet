import { DependencyPrototype } from './utils/prototype';
import { BalancesState } from '$wallet/managers/BalancesManager';
import { Wallet } from '$wallet/Wallet';

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
  constructor(wallet: Wallet) {
    super(wallet.balances.state, (state) => ({
      ton: state.ton,
      tonLocked: state.tonLocked,
      tonRestricted: state.tonRestricted,
    }));
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
