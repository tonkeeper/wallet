import {
  Address,
  beginCell,
  Cell,
  external,
  internal,
  storeMessage,
  MessageRelaxed,
  SendMode,
} from '@ton/core';
import { Address as AddressFormatter } from '../formatters/Address';
import { WalletContract } from './contractService';
import { SignRawMessage } from '@tonkeeper/mobile/src/core/ModalContainer/NFTOperations/TxRequest.types';
import { AmountFormatter } from '../utils/AmountFormatter';

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

  static parseSignRawMessages(messages: SignRawMessage[]) {
    return messages.map((message) =>
      internal({
        to: tonAddress(message.address),
        value: AmountFormatter.fromNanoStatic(message.amount),
        body: message.payload && Cell.fromBase64(message.payload),
        bounce: this.getBounceFlagFromAddress(message.address),
      }),
    );
  }

  static createTransfer(contract, transferParams: TransferParams) {
    const transfer = contract.createTransfer({
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
