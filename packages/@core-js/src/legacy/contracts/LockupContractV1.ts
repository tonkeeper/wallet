import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  internal,
  MessageRelaxed,
  Sender,
  SendMode,
} from '@ton/core';
import { Maybe } from '@ton/ton/dist/utils/maybe';
import { ExternallySingedAuthWallet3SendArgs } from '@ton/ton/dist/wallets/WalletContractV3';
import { createWalletTransferV3 } from '@ton/ton/dist/wallets/signing/createWalletTransfer';

export interface LockupContractV1AdditionalParams {
  allowedDestinations?: Maybe<string>;
  lockupPubKey?: Maybe<string>;
}

export class LockupContractV1 implements Contract {
  static create(args: {
    workchain: number;
    publicKey: Buffer;
    walletId?: Maybe<number>;
    additionalParams?: LockupContractV1AdditionalParams;
  }) {
    return new LockupContractV1(
      args.workchain,
      args.publicKey,
      args.additionalParams?.allowedDestinations,
      args.additionalParams?.lockupPubKey ?? '',
    );
  }

  readonly workchain: number;
  readonly publicKey: Buffer;
  readonly address: Address;
  readonly walletId: number;
  readonly init: { data: Cell; code: Cell };

  private constructor(
    workchain: number,
    publicKey: Buffer,
    allowedDestinations: Maybe<string>,
    configPubKey: string,
    walletId?: Maybe<number>,
  ) {
    // Resolve parameters
    this.workchain = workchain;
    this.publicKey = publicKey;
    if (walletId !== null && walletId !== undefined) {
      this.walletId = walletId;
    } else {
      this.walletId = 698983191 + workchain;
    }
    // Build initial code and data
    let code = Cell.fromBoc(
      Buffer.from(
        'te6ccsECHgEAAmEAAAAADQASABcAHAAhACYApwCvALwAxgDSAOsA8AD1ARIBNgFbAWABZQFqAYMBiAGWAaQBqQG0AcIBzwJLART/APSkE/S88sgLAQIBIAIcAgFIAxECAs0EDAIBIAULAgEgBgoD9wB0NMDAXGwkl8D4PpAMCHHAJJfA+AB0x8hwQKSXwTg8ANRtPABghCC6vnEUrC9sJJfDOCAKIIQgur5xBu6GvL0gCErghA7msoAvvL0B4MI1xiAICH5AVQQNvkQEvL00x+AKYIQNzqp9BO6EvL00wDTHzAB4w8QSBA3XjKAHCAkADBA5SArwBQAWEDdBCvAFCBBXUFYAEBAkQwDwBO1UABMIddJ9KhvpWwxgAC1e1E0NMf0x/T/9P/9AT6APQE+gD0BNGAIBIA0QAgEgDg8ANQIyMofF8ofFcv/E8v/9AAB+gL0AAH6AvQAyYABDFEioFMTgCD0Dm+hlvoA0ROgApEw4shQA/oCQBOAIPRDAYABFSOHiKAIPSWb6UgkzAju5Ex4iCYNfoA0ROhQBOSbCHis+YwgCASASGwIBIBMYAgEgFBUALbUYfgBtiIaKgmCeAMYgfgDGPwTt4gswAgFYFhcAF63OdqJoaZ+Y64X/wAAXrHj2omhpj5jrhY/AAgFIGRoAEbMl+1E0NcLH4AAXsdG+COCAQjD7UPYgABW96feAGIJC+EeADAHy8oMI1xgg0x/TH9MfgCQD+CO7E/Ly8AOAIlGpuhry9IAjUbe6G/L0gB8L+QFUEMX5EBry9PgAUFf4I/AGUJj4I/AGIHEokyDXSo6L0wcx1FEb2zwSsAHoMJIpoN9y+wIGkyDXSpbTB9QC+wDo0QOkR2gUFUMw8ATtVB0AKAHQ0wMBeLCSW3/g+kAx+kAwAfAB2Ae6sw==',
        'base64',
      ),
    )[0];
    let data = beginCell()
      .storeUint(0, 32) // Seqno
      .storeUint(this.walletId, 32)
      .storeBuffer(publicKey)
      .storeBuffer(Buffer.from(configPubKey, 'base64'));
    if (allowedDestinations) {
      data = data.storeBit(1);
      data = data.storeRef(Cell.fromBoc(Buffer.from(allowedDestinations, 'base64'))[0]);
    } else {
      data = data.storeBit(0);
    }

    data = data.storeCoins(0).storeBit(0).storeCoins(0).storeBit(0);

    let cell = data.endCell();

    this.init = { code, data: cell };
    this.address = contractAddress(workchain, { code, data: cell });
  }

  /**
   * Get Wallet Balance
   */
  async getBalance(provider: ContractProvider) {
    let state = await provider.getState();
    return state.balance;
  }

  /**
   * Get Wallet Seqno
   */
  async getSeqno(provider: ContractProvider) {
    let state = await provider.getState();
    if (state.state.type === 'active') {
      let res = await provider.get('seqno', []);
      return res.stack.readNumber();
    } else {
      return 0;
    }
  }

  /**
   * Send signed transfer
   */
  async send(provider: ContractProvider, message: Cell) {
    await provider.external(message);
  }

  /**
   * Sign and send transfer
   */
  async sendTransfer(
    provider: ContractProvider,
    args: {
      seqno: number;
      secretKey: Buffer;
      messages: MessageRelaxed[];
      sendMode?: Maybe<SendMode>;
      timeout?: Maybe<number>;
    },
  ) {
    let transfer = this.createTransfer(args);
    await this.send(provider, transfer);
  }

  /**
   * Create signed transfer
   */
  createTransfer(args: {
    seqno: number;
    secretKey: Buffer;
    messages: MessageRelaxed[];
    sendMode?: Maybe<SendMode>;
    timeout?: Maybe<number>;
  }) {
    let sendMode = SendMode.PAY_GAS_SEPARATELY;
    if (args.sendMode !== null && args.sendMode !== undefined) {
      sendMode = args.sendMode;
    }
    return createWalletTransferV3({
      seqno: args.seqno,
      sendMode,
      secretKey: args.secretKey,
      messages: args.messages,
      timeout: args.timeout,
      walletId: this.walletId,
    });
  }

  createTransferAndSignRequestAsync(args: ExternallySingedAuthWallet3SendArgs) {
    let sendMode = SendMode.PAY_GAS_SEPARATELY;
    if (args.sendMode !== null && args.sendMode !== undefined) {
      sendMode = args.sendMode;
    }
    return createWalletTransferV3({
      ...args,
      sendMode,
      walletId: this.walletId,
    });
  }

  /**
   * Create sender
   */
  sender(provider: ContractProvider, secretKey: Buffer): Sender {
    return {
      send: async (args) => {
        let seqno = await this.getSeqno(provider);
        let transfer = this.createTransfer({
          seqno,
          secretKey,
          sendMode: args.sendMode,
          messages: [
            internal({
              to: args.to,
              value: args.value,
              init: args.init,
              body: args.body,
              bounce: args.bounce,
            }),
          ],
        });
        await this.send(provider, transfer);
      },
    };
  }
}
