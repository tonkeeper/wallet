import AsyncStorage from '@react-native-async-storage/async-storage';
import BigNumber from 'bignumber.js';
import { getUnixTime } from 'date-fns';

import { store } from '$store';
import { getServerConfig } from '$shared/constants';
import { UnlockedVault, Vault } from './vault';
import { debugLog } from '$utils';
import { getWalletName } from '$shared/dynamicConfig';
import { t } from '$translation';
import { Ton } from '$libs/Ton';

import { AccountEvent, Configuration, RawBlockchainApi, SendApi } from 'tonapi-sdk-js';
import axios from 'axios';

const TonWeb = require('tonweb');

export class Wallet {
  readonly name: string;
  readonly vault: Vault;

  readonly ton: TonWallet;

  constructor(name: string, vault: Vault, ton: TonWallet = new TonWallet(vault)) {
    this.name = name;
    this.vault = vault;
    this.ton = ton;
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
  private sendApi: SendApi;
  private rawBlockchainApi: RawBlockchainApi;

  constructor(vault: Vault, provider: any = null) {
    if (!provider) {
      provider = new TonWeb.HttpProvider(getServerConfig('tonEndpoint'), {
        apiKey: getServerConfig('tonEndpointAPIKey'),
      });
    }
    this.vault = vault;
    this.tonweb = new TonWeb(provider);

    const tonApiConfiguration = new Configuration({
      basePath: getServerConfig('tonapiIOEndpoint'),
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
      },
    });
    this.sendApi = new SendApi(tonApiConfiguration);
    this.rawBlockchainApi = new RawBlockchainApi(tonApiConfiguration);
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
    let myinfo: any;
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

    const addr = Ton.formatAddress(walletAddress);
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
      //feeNano = await this.calcFee(tx);
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

  async removeSubscription(unlockedVault: UnlockedVault, subscriptionAddress: string) {
    const isInstalled = this.isSubscriptionActive(subscriptionAddress);
    if (!isInstalled) {
      return;
    }

    let walletAddress = await this.getAddress();
    let myinfo: any;
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

    const fee = await this.calcFee(tx);
    if (fee.isGreaterThan(myinfo.balance)) {
      throw new Error('Insufficient funds');
    }

    try {
      const query = await tx.getQuery();
      const boc = TonWeb.utils.bytesToBase64(await query.toBoc(false));
      await this.sendApi.sendBoc({ sendBocRequest: { boc } });
    } catch (e) {
      if (!store.getState().main.isTimeSynced) {
        throw new Error('wrong_time');
      }
      throw new Error(t('send_publish_tx_error'));
    }

    return {
      fee,
    };
  }

  async isSubscriptionActive(subscriptionAddress: string) {
    return await this.vault.tonWallet.methods.isPluginInstalled(subscriptionAddress);
  }

  private async calcFee(tx: any): Promise<BigNumber> {
    const query = await tx.getQuery();
    const boc = TonWeb.utils.bytesToBase64(await query.toBoc(false));
    const estimatedTx = await this.sendApi.estimateTx({ sendBocRequest: { boc } });

    return new BigNumber(estimatedTx.fee.total.toString());
  }

  private async prepareAddress(address: string): Promise<string> {
    const info = await this.getWalletInfo(address);

    let preparedAddress = address;
    if (['empty', 'uninit'].includes(info.status)) {
      const addr = new TonWeb.utils.Address(preparedAddress);
      preparedAddress = addr.toString(true, false, false);
    }

    return preparedAddress;
  }

  private async estimateTx(tx: any): Promise<AccountEvent> {
    const query = await tx.getQuery();
    const boc = TonWeb.utils.bytesToBase64(await query.toBoc(false));
    const estimatedTx = await this.sendApi.estimateTx({ sendBocRequest: { boc } });

    return estimatedTx;
  }

  private async isInactiveAddress(address: string): Promise<boolean> {
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
    return ['empty', 'uninit'].includes(info.status);
  }

  async estimateJettonFee(
    jettonWalletAddress: string,
    address: string,
    amount: string,
    vault: Vault,
    text: string,
  ) {
    let walletAddress = await this.getAddress();
    let seqno: number;
    try {
      seqno = await this.getSeqno(walletAddress);
    } catch (e) {
      throw new Error(t('send_get_wallet_info_error'));
    }

    const jettonWallet = new TonWeb.token.ft.JettonWallet(this.tonweb.provider, {
      address: jettonWalletAddress,
    });

    let payloadCell = new TonWeb.boc.Cell();
    payloadCell.bits.writeUint(0, 32);
    payloadCell.bits.writeString(text);

    const payload = await jettonWallet.createTransferBody({
      toAddress: new TonWeb.utils.Address(address),
      responseAddress: new TonWeb.utils.Address(await this.getAddress()),
      jettonAmount: new TonWeb.utils.BN(amount, 10),
      forwardAmount: new TonWeb.utils.BN(1, 10),
      forwardPayload: payloadCell.bits.getTopUppedArray(),
    });

    const tx = vault.tonWallet.methods.transfer({
      toAddress: jettonWalletAddress,
      amount: Ton.toNano('0.10'),
      seqno,
      payload,
      sendMode: 3,
    });

    let feeNano = await this.calcFee(tx);

    return Ton.fromNano(feeNano.toString());
  }

  async jettonTransfer(
    jettonWalletAddress: string,
    address: string,
    amount: string,
    unlockedVault: UnlockedVault,
    comment = '',
    sendMode = 3,
    walletVersion: string | null = null,
  ) {
    let wallet: any;
    if (walletVersion) {
      wallet = await unlockedVault.tonWalletByVersion(walletVersion);
    } else {
      wallet = unlockedVault.tonWallet;
    }
    const secretKey = await unlockedVault.getTonPrivateKey();

    // We need to check our seqno which is null if uninitialized.
    // Do not use wallet.methods.seqno().call() - it returns some garbage (85143).
    let myinfo: any;
    let seqno: number;
    try {
      const fromAddress = walletVersion
        ? await this.getAddressByWalletVersion(walletVersion)
        : await this.getAddress();
      myinfo = await this.getWalletInfo(fromAddress);
      seqno = await this.getSeqno(fromAddress);
    } catch (e) {
      throw new Error(t('send_get_wallet_info_error'));
    }

    const jettonWallet = new TonWeb.token.jetton.JettonWallet(this.tonweb.provider, {
      address: jettonWalletAddress,
    });

    const jettonAmount = new TonWeb.utils.BN(amount, 10);
    const { balance } = await jettonWallet.getData();

    if (balance.lt(jettonAmount)) {
      throw new Error(t('send_insufficient_funds'));
    }

    let payloadCell = new TonWeb.boc.Cell();
    payloadCell.bits.writeUint(0, 32);
    payloadCell.bits.writeString(comment);

    const payload = await jettonWallet.createTransferBody({
      toAddress: new TonWeb.utils.Address(address),
      responseAddress: new TonWeb.utils.Address(await this.getAddress()),
      jettonAmount: jettonAmount,
      forwardAmount: new TonWeb.utils.BN(1, 10),
      forwardPayload: payloadCell.bits.getTopUppedArray(),
    });

    const amountTon = Ton.toNano('0.64');

    let tx: any;
    try {
      tx = wallet.methods.transfer({
        secretKey,
        toAddress: jettonWalletAddress,
        amount: amountTon,
        seqno: seqno,
        payload,
        sendMode,
      });
    } catch (e) {
      throw new Error(t('send_build_tx_error'));
    }

    let feeNano: BigNumber;
    try {
      feeNano = await this.calcFee(tx);
    } catch (e) {
      throw new Error(t('send_fee_estimation_error'));
    }

    if (this.isLockup()) {
      const balances = await this.getLockupBalances();
      if (new BigNumber(balances[0]).minus(amount).isLessThan(-balances[1])) {
        throw new Error(t('send_insufficient_funds'));
      }
    } else {
      if (
        new BigNumber(amountTon.toString())
          .plus(sendMode === 128 ? 0 : feeNano)
          .isGreaterThan(myinfo.balance)
      ) {
        throw new Error(t('send_insufficient_funds'));
      }
    }

    try {
      const query = await tx.getQuery();
      const boc = TonWeb.utils.bytesToBase64(await query.toBoc(false));
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

  async estimateFee(address: string, amount: string, vault: Vault, payload = '') {
    let seqno: number;
    try {
      seqno = await this.getSeqno(await this.getAddress());
    } catch (e) {
      throw new Error(t('send_get_wallet_info_error'));
    }

    const tx = vault.tonWallet.methods.transfer({
      toAddress: await this.prepareAddress(address),
      amount: Ton.toNano(amount),
      seqno,
      payload,
      sendMode: 3,
    });

    let feeNano = await this.calcFee(tx);

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
    payload = '',
    sendMode = 3,
    walletVersion: string | null = null,
  ) {
    let wallet: any;
    if (walletVersion) {
      wallet = await unlockedVault.tonWalletByVersion(walletVersion);
    } else {
      wallet = unlockedVault.tonWallet;
    }
    const secretKey = await unlockedVault.getTonPrivateKey();

    // We need to check our seqno which is null if uninitialized.
    // Do not use wallet.methods.seqno().call() - it returns some garbage (85143).
    let myinfo: any;
    let seqno: number;
    try {
      const fromAddress = walletVersion
        ? await this.getAddressByWalletVersion(walletVersion)
        : await this.getAddress();
      myinfo = await this.getWalletInfo(fromAddress);
      seqno = await this.getSeqno(fromAddress);
    } catch (e) {
      throw new Error(t('send_get_wallet_info_error'));
    }

    const amountNano = Ton.toNano(amount);

    let tx: any;
    try {
      tx = wallet.methods.transfer({
        secretKey,
        toAddress: await this.prepareAddress(address),
        amount: amountNano,
        seqno: seqno,
        payload,
        sendMode,
      });
    } catch (e) {
      throw new Error(t('send_build_tx_error'));
    }

    let feeNano: BigNumber;
    try {
      feeNano = await this.calcFee(tx);
    } catch (e) {
      feeNano = new BigNumber('0');
      debugLog('[Transfer]: error estimate fee', e);
    }

    if (this.isLockup()) {
      const balances = await this.getLockupBalances();
      if (new BigNumber(balances[0]).minus(amount).isLessThan(-balances[1])) {
        throw new Error(t('send_insufficient_funds'));
      }
    } else {
      if (
        new BigNumber(amountNano)
          .plus(sendMode === 128 ? 0 : feeNano)
          .isGreaterThan(myinfo.balance)
      ) {
        throw new Error(t('send_insufficient_funds'));
      }
    }

    try {
      const query = await tx.getQuery();
      const boc = TonWeb.utils.bytesToBase64(await query.toBoc(false));
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
    try {
      const endpoint = getServerConfig('tonapiIOEndpoint');
      const response: any = await axios.get(`${endpoint}/v1/account/getInfo`, {
        headers: {
          Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
        },
        params: {
          account: address,
        },
      });
      return response.data;
    } catch (e) {
      console.log(e);
    }
  }

  async getLockupBalances() {
    const address = await this.getAddress();
    const info = await this.getWalletInfo(address);
    if (['empty', 'uninit'].includes(info.status)) {
      try {
        const balance = (await this.rawBlockchainApi.getAccount({ account: address }))
          .balance;
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
      const balance = (await this.rawBlockchainApi.getAccount({ account })).balance;
      return Ton.fromNano(balance);
    } catch (e) {
      return Ton.fromNano('0');
    }
  }
}
