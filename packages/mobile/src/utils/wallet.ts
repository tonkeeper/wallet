export function parseLockupConfig(config: string) {
  let configParsed: any = null;
  try {
    configParsed = JSON.parse(config.trim());
  } catch (e) {
    throw new Error(`Can't parse config: ${e.message}`);
  }

  if (configParsed.wallet_type !== 'lockup-0.1') {
    throw new Error('unsupported wallet_type');
  }

  if (!configParsed.config_pubkey) {
    throw new Error('Bad config');
  }

  if ([0, -1].indexOf(configParsed.workchain) === -1) {
    throw new Error('workchain should be 0 or -1');
  }

  return configParsed;
}
