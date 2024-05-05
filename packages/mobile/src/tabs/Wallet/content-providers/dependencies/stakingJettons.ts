import { DependencyPrototype } from './utils/prototype';

import { Address } from '@tonkeeper/shared/Address';
import { StakingState } from '$wallet/managers/StakingManager';
import { JettonBalanceModel } from '$wallet/models/JettonBalanceModel';
import { Wallet } from '$wallet/Wallet';

export class StakingJettonsDependency extends DependencyPrototype<
  StakingState,
  Pick<StakingState, 'stakingJettons'>
> {
  constructor(wallet: Wallet) {
    super(wallet.staking.state, (state) => ({ stakingJettons: state.stakingJettons }));
  }

  get filterTokensBalancesFn(): (balance: JettonBalanceModel) => boolean {
    return (balance: JettonBalanceModel) => {
      const jettonAddress = Address.parse(balance.jettonAddress).toRaw();
      return !this.state.stakingJettons[jettonAddress];
    };
  }
}
