import { store } from '$store';
import { CryptoCurrency, TokenConfig, TokenConfigTestnet } from '$shared/constants';

export function getTokenConfig(token: CryptoCurrency) {
  const isTestnet = store.getState().main.isTestnet;
  const configs = isTestnet ? TokenConfigTestnet : TokenConfig;
  return configs[token];
}

export function getWalletName(): string {
  return `${getChainName()}_default`;
}

export function getChainName(): 'mainnet' | 'testnet' {
  return store.getState().main.isTestnet ? 'testnet' : 'mainnet';
}
