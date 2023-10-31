import { CreateNftTransferBodyParams, tonAddress } from './transactionService';
import { beginCell } from '@ton/core';
import { WalletContractV4R1 } from '../legacy/wallets/WalletContractV4R1';
import { WalletContractV3R1, WalletContractV3R2, WalletContractV4 } from '@ton/ton';

export enum WalletVersion {
  v3R1 = 0,
  v3R2 = 1,
  v4R1 = 2,
  v4R2 = 3,
}

export const WalletVersions = [
  WalletVersion.v3R1,
  WalletVersion.v3R2,
  WalletVersion.v4R1,
  WalletVersion.v4R2,
];

export const contractVersionsMap = {
  v4R2: WalletVersion.v4R2,
  v4R1: WalletVersion.v4R1,
  v3R2: WalletVersion.v3R2,
  v3R1: WalletVersion.v3R1,
};

export type WalletContract =
  | WalletContractV3R1
  | WalletContractV3R2
  | WalletContractV4R1
  | WalletContractV4;

const workchain = 0;
export class ContractService {
  static getWalletContract(version: WalletVersion, publicKey: Buffer) {
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
  }

  static createNftTransferBody(createNftTransferBodyParams: CreateNftTransferBodyParams) {
    return beginCell()
      .storeUint(0x5fcc3d14, 32)
      .storeUint(0, 64)
      .storeAddress(tonAddress(createNftTransferBodyParams.newOwnerAddress))
      .storeAddress(tonAddress(createNftTransferBodyParams.ownerAddress))
      .storeBit(false)
      .storeCoins(createNftTransferBodyParams.nftForwardAmount ?? 0n)
      .storeMaybeRef(createNftTransferBodyParams.forwardBody)
      .endCell();
  }
}
