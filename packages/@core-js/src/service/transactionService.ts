import {
  Address,
  beginCell,
  Cell,
  external,
  internal,
  storeMessage,
  MessageRelaxed,
  SendMode,
  loadStateInit,
} from '@ton/core';
import { Address as AddressFormatter } from '../formatters/Address';
import { OpCodes, Signer, WalletContract } from './contractService';
import { SignRawMessage } from '@tonkeeper/mobile/src/core/ModalContainer/NFTOperations/TxRequest.types';

export type AnyAddress = string | Address | AddressFormatter;

export interface TransferParams {
  seqno: number;
  timeout?: number;
  sendMode?: number;
  messages: MessageRelaxed[];
}

export function tonAddress(address: AnyAddress) {
  if (typeof address === 'string') {
    return Address.parse(address);
  }
  if (address instanceof AddressFormatter) {
    return Address.parse(address.toRaw());
  }
  return address;
}

export class TransactionService {
  public static TTL = 5 * 60;

  public static getTimeout() {
    return Math.floor(Date.now() / 1e3) + TransactionService.TTL;
  }

  public static externalMessage(contract: WalletContract, seqno: number, body: Cell) {
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
  }

  private static getBounceFlagFromAddress(address: string) {
    try {
      return Address.isFriendly(address)
        ? Address.parseFriendly(address).isBounceable
        : true;
    } catch {
      return true;
    }
  }

  private static parseStateInit(stateInit?: string) {
    if (!stateInit) {
      return;
    }
    const { code, data } = loadStateInit(Cell.fromBase64(stateInit).asSlice());
    return { code, data };
  }

  static parseSignRawMessages(
    messages: SignRawMessage[],
    customExcessesAccount?: string | null,
  ) {
    return messages.map((message) => {
      let payload = message.payload && Cell.fromBase64(message.payload);

      if (payload && customExcessesAccount) {
        payload = TransactionService.rebuildBodyWithCustomExcessesAccount(
          payload,
          customExcessesAccount,
        );
      }

      return internal({
        to: message.address,
        value: BigInt(message.amount),
        body: payload,
        bounce: this.getBounceFlagFromAddress(message.address),
        init: TransactionService.parseStateInit(message.stateInit),
      });
    });
  }

  static rebuildBodyWithCustomExcessesAccount(
    payload: Cell,
    customExcessesAccount: string,
  ) {
    const slice = payload.beginParse();
    const opCode = slice.loadUint(32);
    let builder = beginCell();

    switch (opCode) {
      case OpCodes.STONFI_SWAP:
        builder = builder
          .storeUint(OpCodes.STONFI_SWAP, 32)
          .storeAddress(slice.loadAddress())
          .storeCoins(slice.loadCoins())
          .storeAddress(slice.loadAddress());

        if (slice.loadBoolean()) {
          slice.loadAddress();
        }

        return builder
          .storeBit(1)
          .storeAddress(Address.parse(customExcessesAccount))
          .endCell();
      case OpCodes.NFT_TRANSFER:
        builder = builder
          .storeUint(OpCodes.NFT_TRANSFER, 32)
          .storeUint(slice.loadUint(64), 64)
          .storeAddress(slice.loadAddress());

        slice.loadMaybeAddress();

        while (slice.remainingRefs) {
          builder = builder.storeRef(slice.loadRef());
        }

        return builder
          .storeAddress(Address.parse(customExcessesAccount))
          .storeBits(slice.loadBits(slice.remainingBits))
          .endCell();
      case OpCodes.JETTON_TRANSFER:
        builder = builder
          .storeUint(OpCodes.JETTON_TRANSFER, 32)
          .storeUint(slice.loadUint(64), 64)
          .storeCoins(slice.loadCoins())
          .storeAddress(slice.loadAddress());

        slice.loadMaybeAddress();

        while (slice.remainingRefs) {
          const forwardCell = slice.loadRef();
          // recursively rebuild forward payloads
          builder = builder.storeRef(
            this.rebuildBodyWithCustomExcessesAccount(forwardCell, customExcessesAccount),
          );
        }

        return builder
          .storeAddress(Address.parse(customExcessesAccount))
          .storeBits(slice.loadBits(slice.remainingBits))
          .endCell();
      default:
        return payload;
    }
  }

  static async createTransfer(
    contract: WalletContract,
    signer: Signer,
    transferParams: TransferParams,
  ) {
    const transfer = await contract.createTransferAndSignRequestAsync({
      timeout: transferParams.timeout ?? TransactionService.getTimeout(),
      seqno: transferParams.seqno,
      signer,
      sendMode:
        transferParams.sendMode ?? SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
      messages: transferParams.messages,
    });

    return TransactionService.externalMessage(contract, transferParams.seqno, transfer)
      .toBoc()
      .toString('base64');
  }
}
