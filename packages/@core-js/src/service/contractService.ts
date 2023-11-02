import { AnyAddress, tonAddress } from './transactionService';
import { beginCell, Cell, comment } from '@ton/core';
import { WalletContractV4R1 } from '../legacy/wallets/WalletContractV4R1';
import { LockupContractV1 } from '../legacy/wallets/LockupContractV1';
import { WalletContractV3R1, WalletContractV3R2, WalletContractV4 } from '@ton/ton';

export enum WalletVersion {
  v3R1 = 0,
  v3R2 = 1,
  v4R1 = 2,
  v4R2 = 3,
  LockupV1 = 4,
}

export const contractVersionsMap = {
  v4R2: WalletVersion.v4R2,
  v4R1: WalletVersion.v4R1,
  v3R2: WalletVersion.v3R2,
  v3R1: WalletVersion.v3R1,
  'lockup-0.1': WalletVersion.LockupV1,
};

export type WalletContract =
  | LockupContractV1
  | WalletContractV3R1
  | WalletContractV3R2
  | WalletContractV4R1
  | WalletContractV4;

export interface CreateNftTransferBodyParams {
  forwardAmount?: number | bigint;
  /* Address for return excesses */
  excessesAddress: AnyAddress;
  /* Address of new owner's address */
  newOwnerAddress: AnyAddress;
  forwardBody?: Cell | string;
  queryId?: number;
}

export interface CreateJettonTransferBodyParams {
  forwardAmount?: number | bigint;
  /* Address for return excesses */
  excessesAddress: AnyAddress;
  receiverAddress: AnyAddress;
  jettonAmount: number | bigint;
  forwardBody?: Cell | string;
  queryId?: number;
}

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
      case WalletVersion.LockupV1:
        return LockupContractV1.create({ workchain, publicKey });
    }
  }

  static prepareForwardBody(body?: Cell | string) {
    return typeof body === 'string' ? comment(body) : body;
  }

  static createNftTransferBody(createNftTransferBodyParams: CreateNftTransferBodyParams) {
    return beginCell()
      .storeUint(0x5fcc3d14, 32)
      .storeUint(createNftTransferBodyParams.queryId || 0, 64)
      .storeAddress(tonAddress(createNftTransferBodyParams.newOwnerAddress))
      .storeAddress(tonAddress(createNftTransferBodyParams.excessesAddress))
      .storeBit(false)
      .storeCoins(createNftTransferBodyParams.forwardAmount ?? 1n)
      .storeMaybeRef(this.prepareForwardBody(createNftTransferBodyParams.forwardBody))
      .endCell();
  }

  static createJettonTransferBody(
    createJettonTransferBodyParams: CreateJettonTransferBodyParams,
  ) {
    return beginCell()
      .storeUint(0xf8a7ea5, 32) // request_transfer op
      .storeUint(createJettonTransferBodyParams.queryId || 0, 64)
      .storeCoins(createJettonTransferBodyParams.jettonAmount)
      .storeAddress(tonAddress(createJettonTransferBodyParams.receiverAddress))
      .storeAddress(tonAddress(createJettonTransferBodyParams.excessesAddress))
      .storeBit(false) // null custom_payload
      .storeCoins(createJettonTransferBodyParams.forwardAmount ?? 1n)
      .storeBit(createJettonTransferBodyParams.forwardBody != null) // forward_payload in this slice - false, separate cell - true
      .storeMaybeRef(this.prepareForwardBody(createJettonTransferBodyParams.forwardBody))
      .endCell();
  }
}
