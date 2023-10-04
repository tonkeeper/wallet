import { IStakingStore } from './types';

export const getStakingProviderById = (state: IStakingStore, providerId: string) => {
  return state.providers.find((provider) => provider.id === providerId)!;
};

export const getStakingPoolsByProvider = (state: IStakingStore, providerId: string) => {
  return state.pools.filter((pool) => pool.implementation === providerId);
};

export const getStakingPoolByAddress = (state: IStakingStore, address: string) => {
  return state.pools.find((pool) => pool.address === address)!;
};

export const getStakingJettons = (state: IStakingStore) => {
  return state.pools
    .filter((pool) => !!pool.liquid_jetton_master)
    .map((pool) => pool.liquid_jetton_master!);
};
