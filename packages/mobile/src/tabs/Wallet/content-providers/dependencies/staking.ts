import { DependencyPrototype } from './utils/prototype';
import { tk } from '$wallet';

import { StakingState } from '$wallet/managers/StakingManager';
import { AccountStakingInfo, PoolInfo } from '@tonkeeper/core/src/TonAPI';

export class StakingDependency extends DependencyPrototype<
  StakingState,
  { info: AccountStakingInfo; pool: PoolInfo }[]
> {
  constructor() {
    super(tk.wallet.staking.state, (s) =>
      s.pools.map((pool) => ({ info: s.stakingInfo[pool.address], pool })),
    );
  }

  setWallet(wallet) {
    this.dataProvider = wallet.staking.state;
    super.setWallet(wallet);
  }
}
