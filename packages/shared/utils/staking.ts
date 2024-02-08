import { StakingState } from '@tonkeeper/mobile/src/wallet/managers/StakingManager';

export const getStakingProviderById = (state: StakingState, providerId: string) => {
  return state.providers.find((provider) => provider.id === providerId)!;
};

export const getStakingPoolsByProvider = (state: StakingState, providerId: string) => {
  return state.pools.filter((pool) => pool.implementation === providerId);
};

export const getStakingPoolByAddress = (state: StakingState, address: string) => {
  return state.pools.find((pool) => pool.address === address)!;
};

export const getStakingJettons = (state: StakingState) => {
  return state.pools
    .filter((pool) => !!pool.liquid_jetton_master)
    .map((pool) => pool.liquid_jetton_master!);
};
