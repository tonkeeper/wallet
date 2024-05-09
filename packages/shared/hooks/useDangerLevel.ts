import BigNumber from 'bignumber.js';
import { useWalletSetup } from './useWalletSetup';
import { useWallet } from './useWallet';

export enum DangerLevel {
  Normal,
  Medium,
  High,
}

export const useDangerLevel = (inTonRaw: string): DangerLevel => {
  const { lastBackupAt } = useWalletSetup();
  const wallet = useWallet();

  if (lastBackupAt !== null || wallet.isWatchOnly || wallet.isExternal) {
    return DangerLevel.Normal;
  }

  const inTonBn = new BigNumber(inTonRaw);

  if (inTonBn.gte(20)) {
    return DangerLevel.High;
  } else if (inTonBn.gte(2)) {
    return DangerLevel.Medium;
  }
  return DangerLevel.Normal;
};
