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
import { WalletContract } from './contractService';
import { SignRawMessage } from '@tonkeeper/mobile/src/core/ModalContainer/NFTOperations/TxRequest.types';

export type AnyAddress = string | Address | AddressFormatter;

export interface TransferParams {
  seqno: number;
  sendMode?: number;
  secretKey: Buffer;
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
  private static TTL = 5 * 60;

  private static getTimeout() {
    return Math.floor(Date.now() / 1e3) + TransactionService.TTL;
  }

  private static externalMessage(contract: WalletContract, seqno: number, body: Cell) {
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

  static parseSignRawMessages(messages: SignRawMessage[]) {
    return messages.map((message) =>
      internal({
        to: message.address,
        value: BigInt(message.amount),
        body: message.payload && Cell.fromBase64(message.payload),
        bounce: this.getBounceFlagFromAddress(message.address),
        init: TransactionService.parseStateInit(message.stateInit),
      }),
    );
  }

  static createTransfer(contract, transferParams: TransferParams) {
    const transfer = contract.createTransfer({
      timeout: TransactionService.getTimeout(),
      seqno: transferParams.seqno,
      secretKey: transferParams.secretKey,
      sendMode:
        transferParams.sendMode ?? SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
      messages: transferParams.messages,
    });

    return TransactionService.externalMessage(contract, transferParams.seqno, transfer)
      .toBoc()
      .toString('base64');
  }
}
