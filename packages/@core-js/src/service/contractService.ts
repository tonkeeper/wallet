import { AnyAddress, tonAddress } from './transactionService';
import { beginCell, Cell, comment } from '@ton/core';
import {
  WalletContractV4R1,
  LockupContractV1,
  LockupContractV1AdditionalParams,
} from '../legacy';
import { WalletContractV3R1, WalletContractV3R2, WalletContractV4 } from '@ton/ton';
import nacl from 'tweetnacl';

export type Signer = (message: Cell) => Promise<Buffer>;

export enum OpCodes {
  JETTON_TRANSFER = 0xf8a7ea5,
  NFT_TRANSFER = 0x5fcc3d14,
  STONFI_SWAP = 0x25938561,
}

export enum WalletVersion {
  v3R1 = 0,
  v3R2 = 1,
  v4R1 = 2,
  v4R2 = 3,
  LockupV1 = 4,
}

export const mappedFromLegacyWalletVersion = {
  'lockup-0.1': WalletVersion.LockupV1,
  v3R1: WalletVersion.v3R1,
  v3R2: WalletVersion.v3R2,
  v4R1: WalletVersion.v4R1,
  v4R2: WalletVersion.v4R2,
};

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
  /* Query id. Defaults to Tonkeeper signature query id with 32 random bits */
  queryId?: number;
}

export interface CreateJettonTransferBodyParams {
  forwardAmount?: number | bigint;
  /* Address for return excesses */
  excessesAddress: AnyAddress;
  receiverAddress: AnyAddress;
  jettonAmount: number | bigint;
  forwardBody?: Cell | string;
  /* Query id. Defaults to Tonkeeper signature query id with 32 random bits */
  queryId?: number;
}

export class ContractService {
  static getWalletContract(
    version: WalletVersion,
    publicKey: Buffer,
    workchain: number,
    additionalParams?: LockupContractV1AdditionalParams,
  ) {
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
        return LockupContractV1.create({ workchain, publicKey, additionalParams });
    }
  }

  public static getWalletQueryId() {
    const tonkeeperSignature = (0x546de4ef).toString(16);
    const value = Buffer.concat([
      Buffer.from(tonkeeperSignature, 'hex'),
      nacl.randomBytes(4),
    ]);
    return BigInt('0x' + value.toString('hex'));
  }

  static prepareForwardBody(body?: Cell | string) {
    return typeof body === 'string' ? comment(body) : body;
  }

  static createNftTransferBody(createNftTransferBodyParams: CreateNftTransferBodyParams) {
    return beginCell()
      .storeUint(OpCodes.NFT_TRANSFER, 32)
      .storeUint(
        createNftTransferBodyParams.queryId || ContractService.getWalletQueryId(),
        64,
      )
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
      .storeUint(OpCodes.JETTON_TRANSFER, 32)
      .storeUint(
        createJettonTransferBodyParams.queryId || ContractService.getWalletQueryId(),
        64,
      )
      .storeCoins(createJettonTransferBodyParams.jettonAmount)
      .storeAddress(tonAddress(createJettonTransferBodyParams.receiverAddress))
      .storeAddress(tonAddress(createJettonTransferBodyParams.excessesAddress))
      .storeBit(false) // null custom_payload
      .storeCoins(createJettonTransferBodyParams.forwardAmount ?? 1n)
      .storeMaybeRef(this.prepareForwardBody(createJettonTransferBodyParams.forwardBody))
      .endCell();
  }
}
