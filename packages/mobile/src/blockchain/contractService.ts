import { WalletContractV3R1, WalletContractV3R2, WalletContractV4 } from 'ton';
import { Address, beginCell, Cell, comment, external, storeMessage } from 'ton-core';
import { WalletVersion } from './types';
import { Vault } from './vault';

const workchain = 0;

export const walletContract = (publicKey: Buffer, version: WalletVersion) => {
  switch (version) {
    case WalletVersion.v3R1:
      return WalletContractV3R1.create({ workchain, publicKey });
    case WalletVersion.v3R2:
      return WalletContractV3R2.create({ workchain, publicKey });
    case WalletVersion.v4R1:
      throw new Error('Unsupported wallet contract version - v4R1');
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

export const externalMessage = (
  contract: WalletContractV3R1 | WalletContractV3R2 | WalletContractV4,
  seqno: number,
  body: Cell,
) => {
  return beginCell()
    .storeWritable(
      storeMessage(
        external({
          to: contract.address,
          init: seqno === 0 ? contract.init : undefined,
          body: body,
        }),
      ),
    )
    .endCell();
};

export const jettonTransferBody = (params: {
  queryId?: number;
  jettonAmount: bigint;
  toAddress: Address;
  responseAddress: Address;
  forwardAmount: bigint;
  forwardPayload: Cell | string;
}) => {
  let forwardPayload =
    typeof params.forwardPayload === 'string' && params.forwardPayload.length > 0
      ? comment(params.forwardPayload)
      : null;

  if (params.forwardPayload instanceof Cell) {
    forwardPayload = params.forwardPayload;
  }

  return beginCell()
    .storeUint(0xf8a7ea5, 32) // request_transfer op
    .storeUint(params.queryId || 0, 64)
    .storeCoins(params.jettonAmount)
    .storeAddress(params.toAddress)
    .storeAddress(params.responseAddress)
    .storeBit(false) // null custom_payload
    .storeCoins(params.forwardAmount)
    .storeBit(forwardPayload != null) // forward_payload in this slice - false, separate cell - true
    .storeMaybeRef(forwardPayload)
    .endCell();
};
