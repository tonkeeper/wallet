import { Wallet } from '$wallet/Wallet';
import { Vault } from './vault';
import { TonWallet, Wallet as LegacyWallet } from './wallet';

export const createLegacyWallet = (wallet: Wallet) => {
  const vault = Vault.fromJSON({
    name: wallet.identifier,
    tonPubkey: wallet.pubkey,
    version: wallet.config.version,
    workchain: wallet.config.workchain,
    configPubKey: wallet.config.configPubKey,
    allowedDestinations: wallet.config.allowedDestinations,
  });
  const ton = TonWallet.fromJSON(null, vault);

  const legacyWallet = new LegacyWallet(wallet.identifier, vault, ton);

  return legacyWallet;
};
