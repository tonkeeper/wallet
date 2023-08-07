import AsyncStorage from '@react-native-async-storage/async-storage';
import BigNumber from 'bignumber.js';
import { getUnixTime } from 'date-fns';

import { store } from '$store';
import { getServerConfig } from '$shared/constants';
import { UnlockedVault, Vault } from './vault';
import { Address as AddressFormatter } from '@tonkeeper/core';
import { debugLog } from '$utils/debugLog';
import { getChainName, getWalletName } from '$shared/dynamicConfig';
import { t } from '@tonkeeper/shared/i18n';
import { Ton } from '$libs/Ton';

import axios from 'axios';
import { Tonapi } from '$libs/Tonapi';
import { Address as TAddress } from '$store/wallet/interface';
import {
  Configuration,
  BlockchainApi,
  AccountsApi,
  Account,
} from '@tonkeeper/core/src/legacy';
import { SendApi, Configuration as V1Configuration } from 'tonapi-sdk-js';
import {
  externalMessage,
  getTonCoreWalletContract,
  jettonTransferBody,
} from './contractService';
import { Address, Cell, SendMode, internal, toNano } from 'ton-core';

const TonWeb = require('tonweb');

export const jettonTransferAmount = toNano('0.64');
const jettonTransferForwardAmount = BigInt('1');

export class Wallet {
  readonly name: string;
  readonly vault: Vault;
  address: TAddress | null = null;

  readonly ton: TonWallet;

  constructor(name: string, vault: Vault, ton: TonWallet = new TonWallet(vault)) {
    this.name = name;
    this.vault = vault;
    this.ton = ton;

    this.getReadableAddress();
  }

  public async getReadableAddress() {
    if (this.vault) {
      const rawAddress = await this.vault.getRawTonAddress();
      const friendlyAddress = await this.vault.getTonAddress(
        !(getChainName() === 'mainnet'),
      );
      const version = this.vault.getVersion();

      this.address = {
        rawAddress: rawAddress.toString(false),
        friendlyAddress,
        version,
      };
    }
  }

  // Loads wallet from the disk storage
  static async load(name: string = getWalletName()): Promise<Wallet | null> {
    const data = await AsyncStorage.getItem(`${name}_wallet`);

    if (!data) {
      return null;
    }

    try {
      const json = JSON.parse(data);
      const vault = Vault.fromJSON(json.vault);
      const ton = TonWallet.fromJSON(json.ton, vault);

      return new Wallet(name, vault, ton);
    } catch (e) {}

    return null;
  }
  // Saves the wallet on disk
  async save(): Promise<void> {
    await AsyncStorage.setItem(
      `${this.name}_wallet`,
      JSON.stringify({
        vault: this.vault.toJSON(),
        ton: this.ton.toJSON(),
      }),
    );
  }

  async clean() {
    await AsyncStorage.removeItem(`${this.name}_wallet`);
  }
}

export class TonWallet {
  private tonweb: any;
  private vault: Vault;
  private blockchainApi: BlockchainApi;
  private accountsApi: AccountsApi;
  private sendApi: SendApi;

  constructor(vault: Vault, provider: any = null) {
    if (!provider) {
      provider = new TonWeb.HttpProvider(getServerConfig('tonEndpoint'), {
        apiKey: getServerConfig('tonEndpointAPIKey'),
      });
    }
    this.vault = vault;
    this.tonweb = new TonWeb(provider);

    const tonApiConfiguration = new Configuration({
      basePath: getServerConfig('tonapiV2Endpoint'),
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiV2Key')}`,
      },
    });
    this.blockchainApi = new BlockchainApi(tonApiConfiguration);
    this.accountsApi = new AccountsApi(tonApiConfiguration);

    this.sendApi = new SendApi(
      new V1Configuration({
        basePath: getServerConfig('tonapiIOEndpoint'),
        headers: {
          Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
        },
      }),
    );
  }

  static fromJSON(json: any, vault: Vault): TonWallet {
    // TBD
    return new TonWallet(vault);
  }

  toJSON(): any {
    return {};
  }

  getTonWeb() {
    return this.tonweb;
  }

  get isTestnet(): boolean {
    return store.getState().main.isTestnet;
  }

  get version(): string | undefined {
    return this.vault.getVersion();
  }

  isV4() {
    return this.vault.getVersion() === 'v4R2';
  }

  isLockup() {
    const version = this.vault.getVersion();
    return version && version.substr(0, 6) === 'lockup';
  }

  async getAddress() {
    return this.vault.getTonAddress(this.isTestnet);
  }

  async getAddressByWalletVersion(version: string) {
    return this.vault.getTonAddressByWalletVersion(this.tonweb, version, this.isTestnet);
  }

  /*
    All addresses, from newest to oldest
   */
  async getAllAddresses() {
    const versions = ['v4R2', 'v4R1', 'v3R2', 'v3R1'];
    const addresses = {};
    for (let version of versions) {
      addresses[version] = await this.getAddressByWalletVersion(version);
    }
    return addresses;
  }

  async getSeqno(address: string): Promise<number> {
    try {
      const endpoint = getServerConfig('tonapiIOEndpoint');
      const response: any = await axios.get(`${endpoint}/v1/wallet/getSeqno`, {
        headers: {
          Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
        },
        params: {
          account: address,
        },
      });
      return response.data?.seqno ?? 0;
    } catch (err) {
      if (err.response.status === 400) {
        return 0;
      }
      throw err;
    }
  }

  async createSubscription(
    unlockedVault: UnlockedVault | Vault,
    beneficiaryAddress: string,
    amountNano: string,
    interval: number,
    subscriptionId: number,
    testOnly = false,
  ) {
    let myinfo: Account;
    try {
      myinfo = await this.getWalletInfo(await this.getAddress());
    } catch (e) {
      throw new Error(t('send_get_wallet_info_error'));
    }

    const walletAddress = await unlockedVault.tonWallet.getAddress();

    const startAt = getUnixTime(new Date());
    const subscription = new TonWeb.SubscriptionContract(this.tonweb.provider, {
      wc: 0,
      wallet: walletAddress,
      beneficiary: new TonWeb.utils.Address(beneficiaryAddress),
      amount: amountNano,
      period: interval,
      timeout: 3 * 60 * 60, // 3 hour
      subscriptionId,
      startAt,
    });

    const subscriptionAddress = await subscription.getAddress();

    const addr = AddressFormatter(walletAddress).toRaw();
    const seqno = await this.getSeqno(addr);

    const params: any = {
      seqno: seqno || 0,
      pluginWc: 0,
      amount: amountNano,
      stateInit: (await subscription.createStateInit()).stateInit,
      body: subscription.createBody(),
    };
    if (!testOnly) {
      params.secretKey = await (unlockedVault as UnlockedVault).getTonPrivateKey();
    }

    const tx = unlockedVault.tonWallet.methods.deployAndInstallPlugin(params);
    let feeNano: BigNumber;
    if (['empty', 'uninit'].includes(myinfo.status)) {
      feeNano = new BigNumber(Ton.toNano('0.1').toString());
    } else {
      feeNano = new BigNumber(Ton.toNano('0.03').toString());
    }

    if (testOnly) {
      return {
        fee: feeNano,
      };
    }

    const queryMsg = await tx.getQuery();
    const boc = TonWeb.utils.bytesToBase64(await queryMsg.toBoc(false));

    return {
      subscriptionAddress: subscriptionAddress.toString(false),
      walletAddress: walletAddress.toString(false),
      signedTx: boc,
      fee: feeNano,
      startAt,
    };
  }

  async getCancelSubscriptionBoc(
    unlockedVault: UnlockedVault,
    subscriptionAddress: string,
  ) {
    const isInstalled = this.isSubscriptionActive(subscriptionAddress);
    if (!isInstalled) {
      return;
    }

    let walletAddress = await this.getAddress();
    let myinfo: Account;
    try {
      myinfo = await this.getWalletInfo(walletAddress);
    } catch (e) {
      throw new Error(t('send_get_wallet_info_error'));
    }

    const seqno = await this.getSeqno(walletAddress);
    const tx = await unlockedVault.tonWallet.methods.removePlugin({
      secretKey: await unlockedVault.getTonPrivateKey(),
      amount: Ton.toNano('0.007'),
      seqno,
      pluginAddress: subscriptionAddress,
    });

    const query = await tx.getQuery();
    const boc = TonWeb.utils.bytesToBase64(await query.toBoc(false));

    const fee = await this.calcFee(boc);
    if (fee.isGreaterThan(myinfo.balance)) {
      throw new Error('Insufficient funds');
    }

    return boc;
  }

  async isSubscriptionActive(subscriptionAddress: string) {
    return await this.vault.tonWallet.methods.isPluginInstalled(subscriptionAddress);
  }

  private async calcFee(boc: string): Promise<BigNumber> {
    const estimatedTx = await this.sendApi.estimateTx({ sendBocRequest: { boc } });

    return new BigNumber(estimatedTx.fee.total.toString());
  }

  async isInactiveAddress(address: string): Promise<boolean> {
    const addr = new TonWeb.utils.Address(address);
    // if address is already marked as no-bounce,
    // then it is safe to send coins to it regardless
    // of the contract status.
    if (!addr.isBounceable) {
      return false;
    }
    // If the address is marked as bounceable and the contract is uninit,
    // then tx is guaranteed to bounce. If the user wants to force-send
    // coins (because most wallets use EQ... bounce=true format),
    // then we display warning about "inactive contract".
    const info = await this.getWalletInfo(address);
    return ['empty', 'uninit', 'nonexist'].includes(info?.status ?? '');
  }

  createJettonTransfer(
    seqno: number,
    jettonWalletAddress: string,
    sender: Account,
    recipient: Account,
    amountNano: string,
    payload: Cell | string = '',
    vault: Vault,
    secretKey: Buffer = Buffer.alloc(64),
  ) {
    const contract = getTonCoreWalletContract(vault, vault.getVersion());

    const jettonAmount = BigInt(amountNano);

    const body = jettonTransferBody({
      queryId: Date.now(),
      jettonAmount,
      toAddress: Address.parse(recipient.address),
      responseAddress: Address.parse(sender.address),
      forwardAmount: jettonTransferForwardAmount,
      forwardPayload: payload,
    });

    console.log('payload', payload);

    const transfer = contract.createTransfer({
      seqno,
      secretKey,
      sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
      messages: [
        internal({
          to: Address.parse(jettonWalletAddress),
          bounce: true,
          value: jettonTransferAmount,
          body: body,
        }),
      ],
    });

    return externalMessage(contract, seqno, transfer).toBoc().toString('base64');
  }

  async estimateJettonFee(
    jettonWalletAddress: string,
    address: string,
    amountNano: string,
    vault: Vault,
    payload: Cell | string = '',
  ) {
    let sender: Account;
    let recipient: Account;
    let seqno: number;
    try {
      const fromAddress = await this.getAddress();
      sender = await this.getWalletInfo(fromAddress);
      recipient = await this.getWalletInfo(address);
      seqno = await this.getSeqno(fromAddress);
    } catch (e) {
      throw new Error(t('send_get_wallet_info_error'));
    }

    const boc = this.createJettonTransfer(
      seqno,
      jettonWalletAddress,
      sender,
      recipient,
      amountNano,
      payload,
      vault,
    );

    let feeNano = await this.calcFee(boc);

    return Ton.fromNano(feeNano.toString());
  }

  async jettonTransfer(
    jettonWalletAddress: string,
    address: string,
    amountNano: string,
    unlockedVault: UnlockedVault,
    payload: Cell | string = '',
  ) {
    let sender: Account;
    let recipient: Account;
    let seqno: number;
    try {
      const fromAddress = await this.getAddress();
      sender = await this.getWalletInfo(fromAddress);
      recipient = await this.getWalletInfo(address);
      seqno = await this.getSeqno(fromAddress);
    } catch (e) {
      throw new Error(t('send_get_wallet_info_error'));
    }

    const secretKey = await unlockedVault.getTonPrivateKey();

    const { balances } = await Tonapi.getJettonBalances(sender.address);

    const balance = balances.find((jettonBalance) =>
      AddressFormatter.compare(jettonBalance.wallet_address.address, jettonWalletAddress),
    );

    if (new BigNumber(balance.balance).lt(new BigNumber(amountNano))) {
      throw new Error(t('send_insufficient_funds'));
    }

    const boc = this.createJettonTransfer(
      seqno,
      jettonWalletAddress,
      sender,
      recipient,
      amountNano,
      payload,
      unlockedVault,
      Buffer.from(secretKey),
    );

    let feeNano: BigNumber;
    try {
      feeNano = await this.calcFee(boc);
    } catch (e) {
      throw new Error(t('send_fee_estimation_error'));
    }

    if (this.isLockup()) {
      const lockupBalances = await this.getLockupBalances(sender);
      if (new BigNumber(lockupBalances[0]).minus(amountNano).isLessThan(-lockupBalances[1])) {
        throw new Error(t('send_insufficient_funds'));
      }
    } else {
      if (
        new BigNumber(jettonTransferAmount.toString())
          .plus(feeNano)
          .isGreaterThan(sender.balance)
      ) {
        throw new Error(t('send_insufficient_funds'));
      }
    }

    try {
      await this.sendApi.sendBoc({ sendBocRequest: { boc } });
    } catch (e) {
      if (!store.getState().main.isTimeSynced) {
        throw new Error('wrong_time');
      }
      throw new Error(t('send_publish_tx_error'));
    }

    return {
      seqno: seqno,
      fee: Ton.fromNano(feeNano.toString()),
    };
  }

  createTonTransfer(
    seqno: number,
    recipient: Account,
    amount: string,
    payload: Cell | string = '',
    sendMode = 3,
    vault: Vault,
    walletVersion: string | null = null,
    secretKey: Buffer = Buffer.alloc(64),
  ) {
    const contract = getTonCoreWalletContract(vault, walletVersion ?? vault.getVersion());

    const transfer = contract.createTransfer({
      seqno,
      secretKey,
      sendMode,
      messages: [
        internal({
          to: recipient.address,
          bounce: recipient.status === 'active',
          value: amount,
          body: payload !== '' ? payload : undefined,
        }),
      ],
    });

    return externalMessage(contract, seqno, transfer).toBoc().toString('base64');
  }

  async estimateFee(
    address: string,
    amount: string,
    vault: Vault,
    payload: Cell | '' = '',
    sendMode = 3,
    walletVersion: string | null = null,
  ) {
    let recipientInfo: Account;
    let seqno: number;
    try {
      const fromAddress = walletVersion
        ? await this.getAddressByWalletVersion(walletVersion)
        : await this.getAddress();
      recipientInfo = await this.getWalletInfo(address);
      seqno = await this.getSeqno(fromAddress);
    } catch (e) {
      throw new Error(t('send_get_wallet_info_error'));
    }

    const boc = this.createTonTransfer(
      seqno,
      recipientInfo,
      amount,
      payload,
      sendMode,
      vault,
      walletVersion,
    );

    let feeNano = await this.calcFee(boc);

    return Ton.fromNano(feeNano.toString());
  }

  async deploy(unlockedVault: UnlockedVault) {
    const wallet = unlockedVault.tonWallet;
    const secretKey = await unlockedVault.getTonPrivateKey();

    await wallet.deploy(secretKey).send();
  }

  async transfer(
    address: string,
    amount: string,
    unlockedVault: UnlockedVault,
    payload: Cell | '' = '',
    sendMode = 3,
    walletVersion: string | null = null,
  ) {
    const secretKey = await unlockedVault.getTonPrivateKey();

    // We need to check our seqno which is null if uninitialized.
    // Do not use wallet.methods.seqno().call() - it returns some garbage (85143).
    let fromInfo: Account;
    let recipientInfo: Account;
    let seqno: number;
    try {
      const fromAddress = walletVersion
        ? await this.getAddressByWalletVersion(walletVersion)
        : await this.getAddress();
      fromInfo = await this.getWalletInfo(fromAddress);
      recipientInfo = await this.getWalletInfo(address);
      seqno = await this.getSeqno(fromAddress);
    } catch (e) {
      throw new Error(t('send_get_wallet_info_error'));
    }

    const amountNano = Ton.toNano(amount);

    const boc = this.createTonTransfer(
      seqno,
      recipientInfo,
      amount,
      payload,
      sendMode,
      unlockedVault,
      walletVersion,
      Buffer.from(secretKey),
    );

    let feeNano: BigNumber;
    try {
      feeNano = await this.calcFee(boc);
    } catch (e) {
      feeNano = new BigNumber('0');
      debugLog('[Transfer]: error estimate fee', e);
    }

    if (this.isLockup()) {
      const balances = await this.getLockupBalances(fromInfo);
      if (new BigNumber(balances[0]).minus(amount).isLessThan(-balances[1])) {
        throw new Error(t('send_insufficient_funds'));
      }
    } else {
      if (
        new BigNumber(amountNano)
          .plus(sendMode === 128 ? 0 : feeNano)
          .isGreaterThan(fromInfo.balance)
      ) {
        throw new Error(t('send_insufficient_funds'));
      }
    }

    try {
      await this.sendApi.sendBoc({ sendBocRequest: { boc } });
    } catch (e) {
      if (!store.getState().main.isTimeSynced) {
        throw new Error('wrong_time');
      }
      throw new Error(t('send_publish_tx_error'));
    }

    return {
      seqno: seqno,
      fee: Ton.fromNano(feeNano.toString()),
    };
  }

  async getWalletInfo(address: string) {
    return await this.accountsApi.getAccount({ accountId: address });
  }

  async getPublicKeyByAddress(address: string): Promise<Buffer> {
    const { publicKey } = await this.accountsApi.getPublicKeyByAccountID({
      accountId: address,
    });
    return Buffer.from(publicKey, 'hex');
  }

  async getLockupBalances(info: Account) {
    if (['empty', 'uninit', 'nonexist'].includes(info?.status ?? '')) {
      try {
        const balance = (
          await this.blockchainApi.getRawAccount({ accountId: info.address })
        ).balance;
        return [Ton.fromNano(balance), 0, 0];
      } catch (e) {
        return [Ton.fromNano('0'), 0, 0];
      }
    }

    const balances = await this.vault.tonWallet.getBalances();
    const result = balances.map((item: number) => Ton.fromNano(item.toString()));
    result[0] = new BigNumber(result[0]).minus(result[1]).minus(result[2]).toString();

    return result;
  }

  async getBalance(): Promise<string> {
    const account = await this.vault.getTonAddress(this.isTestnet);
    try {
      const balance = (await this.blockchainApi.getRawAccount({ accountId: account }))
        .balance;
      return Ton.fromNano(balance);
    } catch (e) {
      return Ton.fromNano('0');
    }
  }
}
