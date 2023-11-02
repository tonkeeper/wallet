import { WalletContractV3R1, WalletContractV3R2, WalletContractV4 } from '@ton/ton';
import { WalletVersion } from './types';
import { Vault } from './vault';
import { WalletContractV4R1 } from '@tonkeeper/core/src/legacy/wallets/WalletContractV4R1';

const workchain = 0;

export const walletContract = (publicKey: Buffer, version: WalletVersion) => {
  switch (version) {
    case WalletVersion.v3R1:
      return WalletContractV3R1.create({ workchain, publicKey });
    case WalletVersion.v3R2:
      return WalletContractV3R2.create({ workchain, publicKey });
    case WalletVersion.v4R1:
      return WalletContractV4R1.create({ workchain, publicKey });
    case WalletVersion.v4R2:
      return WalletContractV4.create({ workchain, publicKey });
  }
};

export const contractVersionsMap = {
  v4R2: WalletVersion.v4R2,
  v4R1: WalletVersion.v4R1,
  v3R2: WalletVersion.v3R2,
  v3R1: WalletVersion.v3R1,
};

export const getTonCoreWalletContract = (vault: Vault, version = 'v4R2') => {
  return walletContract(Buffer.from(vault.tonPublicKey), contractVersionsMap[version]);
};
