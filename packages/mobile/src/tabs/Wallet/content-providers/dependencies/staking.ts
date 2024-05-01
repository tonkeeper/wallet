import { DependencyPrototype } from './utils/prototype';

import { StakingState } from '$wallet/managers/StakingManager';
import { AccountStakingInfo, PoolInfo } from '@tonkeeper/core/src/TonAPI';
import { Wallet } from '$wallet/Wallet';

export class StakingDependency extends DependencyPrototype<
  StakingState,
  { info: AccountStakingInfo; pool: PoolInfo }[]
> {
  constructor(wallet: Wallet) {
    super(wallet.staking.state, (s) =>
      s.pools.map((pool) => ({ info: s.stakingInfo[pool.address], pool })),
    );
  }
}
