import { store } from '$store';

export function getWalletName(): string {
  return `${getChainName()}_default`;
}

export function getChainName(): 'mainnet' | 'testnet' {
  return store.getState().main.isTestnet ? 'testnet' : 'mainnet';
}
