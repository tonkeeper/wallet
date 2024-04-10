import { DependencyPrototype } from './utils/prototype';
import { tk } from '$wallet';

import { Address } from '@tonkeeper/shared/Address';
import { StakingState } from '$wallet/managers/StakingManager';
import { JettonBalanceModel } from '$wallet/models/JettonBalanceModel';

export class StakingJettonsDependency extends DependencyPrototype<
  StakingState,
  Pick<StakingState, 'stakingJettons'>
> {
  constructor() {
    super(tk.wallet.staking.state, (state) => ({ stakingJettons: state.stakingJettons }));
  }

  setWallet(wallet) {
    this.dataProvider = wallet.staking.state;
    super.setWallet(wallet);
  }

  get filterTokensBalancesFn(): (balance: JettonBalanceModel) => boolean {
    return (balance: JettonBalanceModel) => {
      const jettonAddress = Address.parse(balance.jettonAddress).toRaw();
      return !this.state.stakingJettons[jettonAddress];
    };
  }
}
