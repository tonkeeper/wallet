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
import {
  ExternallySingedAuthWallet4SendArgs,
  SingedAuthWallet4SendArgs,
} from '@ton/ton/dist/wallets/WalletContractV4';
import { createWalletTransferV4 } from '@ton/ton/dist/wallets/signing/createWalletTransfer';
import {
  ExternallySingedAuthSendArgs,
  SingedAuthSendArgs,
} from '@ton/ton/dist/wallets/signing/singer';

export class WalletContractV4R1 implements Contract {
  static create(args: {
    workchain: number;
    publicKey: Buffer;
    walletId?: Maybe<number>;
  }) {
    return new WalletContractV4R1(args.workchain, args.publicKey, args.walletId);
  }

  readonly workchain: number;
  readonly publicKey: Buffer;
  readonly address: Address;
  readonly walletId: number;
  readonly init: { data: Cell; code: Cell };

  private constructor(workchain: number, publicKey: Buffer, walletId?: Maybe<number>) {
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
        'te6cckECFQEAAvUAART/APSkE/S88sgLAQIBIAIQAgFIAwcD7tAB0NMDAXGwkVvgIddJwSCRW+AB0x8hghBwbHVnvSKCEGJsbmO9sCKCEGRzdHK9sJJfA+AC+kAwIPpEAcjKB8v/ydDtRNCBAUDXIfQEMFyBAQj0Cm+hMbOSXwXgBNM/yCWCEHBsdWe6kTHjDSSCEGJsbmO64wAEBAUGAFAB+gD0BDCCEHBsdWeDHrFwgBhQBcsFJ88WUAP6AvQAEstpyx9SEMs/AFL4J28ighBibG5jgx6xcIAYUAXLBSfPFiT6AhTLahPLH1Iwyz8B+gL0AACSghBkc3Ryuo41BIEBCPRZMO1E0IEBQNcgyAHPFvQAye1UghBkc3Rygx6xcIAYUATLBVjPFiL6AhLLassfyz+UEDRfBOLJgED7AAIBIAgPAgEgCQ4CAVgKCwA9sp37UTQgQFA1yH0BDACyMoHy//J0AGBAQj0Cm+hMYAIBIAwNABmtznaiaEAga5Drhf/AABmvHfaiaEAQa5DrhY/AABG4yX7UTQ1wsfgAWb0kK29qJoQICga5D6AhhHDUCAhHpJN9KZEM5pA+n/mDeBKAG3gQFImHFZ8xhAT48oMI1xgg0x/TH9MfAvgju/Jj7UTQ0x/TH9P/9ATRUUO68qFRUbryogX5AVQQZPkQ8qP4ACSkyMsfUkDLH1Iwy/9SEPQAye1U+A8B0wchwACfbFGTINdKltMH1AL7AOgw4CHAAeMAIcAC4wABwAORMOMNA6TIyx8Syx/L/xESExQAbtIH+gDU1CL5AAXIygcVy//J0Hd0gBjIywXLAiLPFlAF+gIUy2sSzMzJcfsAyEAUgQEI9FHypwIAbIEBCNcYyFQgJYEBCPRR8qeCEG5vdGVwdIAYyMsFywJQBM8WghAF9eEA+gITy2oSyx/JcfsAAgBygQEI1xgwUgKBAQj0WfKn+CWCEGRzdHJwdIAYyMsFywJQBc8WghAF9eEA+gIUy2oTyx8Syz/Jc/sAAAr0AMntVHbNOpo=',
        'base64',
      ),
    )[0];
    let data = beginCell()
      .storeUint(0, 32) // Seqno
      .storeUint(this.walletId, 32)
      .storeBuffer(this.publicKey)
      .storeBit(0) // Empty plugins dict
      .endCell();
    this.init = { code, data };
    this.address = contractAddress(workchain, { code, data });
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
    return createWalletTransferV4({
      seqno: args.seqno,
      sendMode,
      secretKey: args.secretKey,
      messages: args.messages,
      timeout: args.timeout,
      walletId: this.walletId,
    });
  }

  /**
   * Create signed transfer
   */
  createTransferAndSignRequestAsync(args: ExternallySingedAuthWallet4SendArgs) {
    let sendMode = SendMode.PAY_GAS_SEPARATELY;
    if (args.sendMode !== null && args.sendMode !== undefined) {
      sendMode = args.sendMode;
    }
    return createWalletTransferV4({
      ...args,
      walletId: this.walletId,
      sendMode,
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
