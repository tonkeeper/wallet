import BigNumber from 'bignumber.js';
import { getUnixTime } from 'date-fns';

import { store } from '$store';
import { UnlockedVault, Vault } from './vault';
import {
  Address as AddressFormatter,
  BASE_FORWARD_AMOUNT,
  ContractService,
  contractVersionsMap,
  isActiveAccount,
  ONE_TON,
  TransactionService,
} from '@tonkeeper/core';
import { debugLog } from '$utils/debugLog';
import { t } from '@tonkeeper/shared/i18n';
import { Ton } from '$libs/Ton';

import { Address as TAddress } from '$store/wallet/interface';
import {
  Account,
  AccountsApi,
  BlockchainApi,
  Configuration,
} from '@tonkeeper/core/src/legacy';

import { tk } from '$wallet';
import { Address, Cell, internal } from '@ton/core';
import {
  emulateWithBattery,
  sendBocWithBattery,
} from '@tonkeeper/shared/utils/blockchain';
import { OperationEnum, TonAPI, TypeEnum } from '@tonkeeper/core/src/TonAPI';
import { setBalanceForEmulation } from '@tonkeeper/shared/utils/wallet';
import { WalletNetwork } from '$wallet/WalletTypes';
import { createTonApiInstance } from '$wallet/utils';
import { config } from '$config';
import { toNano } from '$utils';

const TonWeb = require('tonweb');

export const inscriptionTransferAmount = '0.05';

interface JettonTransferParams {
  seqno: number;
  jettonWalletAddress: string;
  recipient: Account;
  amountNano: string;
  payload: Cell | string;
  vault: Vault;
  secretKey?: Buffer;
  excessesAccount?: string | null;
  jettonTransferAmount?: bigint;
}

interface TonTransferParams {
  seqno: number;
  recipient: Account;
  amount: string;
  payload?: Cell | string;
  sendMode?: number;
  vault: Vault;
  walletVersion?: string | null;
  secretKey?: Buffer;
  bounce: boolean;
}

export class Wallet {
  readonly name: string;
  readonly vault: Vault;
  address: TAddress | null = null;

  readonly ton: TonWallet;

  tonapi: TonAPI;

  constructor(name: string, vault: Vault, ton: TonWallet = new TonWallet(vault)) {
    this.name = name;
    this.vault = vault;
    this.ton = ton;

    this.getReadableAddress();

    this.tonapi = createTonApiInstance(
      tk.wallet.config.network === WalletNetwork.testnet,
    );
  }

  public async getReadableAddress() {
    if (this.vault) {
      const rawAddress = await this.vault.getRawTonAddress();
      const tkWallet = tk.wallets.get(this.name)!;
      const friendlyAddress = await this.vault.getTonAddress(
        tkWallet.config.network === WalletNetwork.testnet,
      );
      const version = this.vault.getVersion()!;

      this.address = {
        rawAddress: rawAddress.toString(false),
        friendlyAddress,
        version,
      };
    }
  }

  async clean() {
    await tk.removeWallet(this.vault.name);
  }
}

export class TonWallet {
  private tonweb: any;
  public vault: Vault;
  private blockchainApi: BlockchainApi;
  private accountsApi: AccountsApi;

  private tonapi: TonAPI;

  constructor(vault: Vault, provider: any = null) {
    if (!provider) {
      provider = new TonWeb.HttpProvider(config.get('tonEndpoint'), {
        apiKey: config.get('tonEndpointAPIKey'),
      });
    }
    this.vault = vault;
    this.tonweb = new TonWeb(provider);

    const tonApiConfiguration = new Configuration({
      basePath: config.get(
        'tonapiV2Endpoint',
        tk.wallet.config.network === WalletNetwork.testnet,
      ),
      headers: {
        Authorization: `Bearer ${config.get(
          'tonApiV2Key',
          tk.wallet.config.network === WalletNetwork.testnet,
        )}`,
      },
    });
    this.blockchainApi = new BlockchainApi(tonApiConfiguration);
    this.accountsApi = new AccountsApi(tonApiConfiguration);
    this.tonapi = createTonApiInstance(
      tk.wallet.config.network === WalletNetwork.testnet,
    );
  }

  static fromJSON(json: any, vault: Vault): TonWallet {
    // TBD
    return new TonWallet(vault);
  }

  getTonWeb() {
    return this.tonweb;
  }

  get isTestnet(): boolean {
    return tk.wallet.isTestnet;
  }

  get version(): string | undefined {
    return this.vault.getVersion();
  }

  get workchain() {
    return this.vault.workchain;
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

  async createStateInitBase64() {
    const { stateInit } = await this.vault.tonWallet.createStateInit();
    return TonWeb.utils.bytesToBase64(await stateInit.toBoc(false));
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
      const seqno = (await this.tonapi.wallet.getAccountSeqno(address)).seqno;

      return seqno;
    } catch (err) {
      if (err.response.status === 400) {
        return 0;
      }
      throw err;
    }
  }

  private async sendBoc(boc: string): Promise<void> {
    await sendBocWithBattery(boc);
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

    const addr = AddressFormatter.parse(walletAddress).toRaw();
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

    const [fee] = await this.calcFee(boc);
    if (fee.isGreaterThan(myinfo.balance)) {
      throw new Error('Insufficient funds');
    }

    return boc;
  }

  async isSubscriptionActive(subscriptionAddress: string) {
    return await this.vault.tonWallet.methods.isPluginInstalled(subscriptionAddress);
  }

  private async calcFee(boc: string, params?): Promise<[BigNumber, boolean]> {
    const { emulateResult, battery } = await emulateWithBattery(boc, params);
    return [new BigNumber(emulateResult.event.extra).multipliedBy(-1), battery];
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

  createJettonTransfer({
    seqno,
    jettonWalletAddress,
    recipient,
    amountNano,
    payload = '',
    vault,
    secretKey = Buffer.alloc(64),
    excessesAccount = null,
    jettonTransferAmount = ONE_TON,
  }: JettonTransferParams) {
    const version = vault.getVersion();
    const lockupConfig = vault.getLockupConfig();
    const contract = ContractService.getWalletContract(
      contractVersionsMap[version ?? 'v4R2'],
      Buffer.from(vault.tonPublicKey),
      vault.workchain,
      {
        allowedDestinations: lockupConfig?.allowed_destinations,
      },
    );

    const jettonAmount = BigInt(amountNano);

    return TransactionService.createTransfer(contract, {
      seqno,
      secretKey,
      messages: [
        internal({
          to: Address.parse(jettonWalletAddress),
          bounce: true,
          value: jettonTransferAmount,
          body: ContractService.createJettonTransferBody({
            jettonAmount,
            receiverAddress: recipient.address,
            excessesAddress: excessesAccount ?? tk.wallet.address.ton.raw,
            forwardBody: payload,
          }),
        }),
      ],
    });
  }

  async estimateJettonFee(
    jettonWalletAddress: string,
    address: string,
    amountNano: string,
    vault: Vault,
    payload: Cell | string = '',
  ) {
    let recipient: Account;
    let seqno: number;
    try {
      const fromAddress = await this.getAddress();
      recipient = await this.getWalletInfo(address);
      seqno = await this.getSeqno(fromAddress);
    } catch (e) {
      throw new Error(t('send_get_wallet_info_error'));
    }

    const boc = this.createJettonTransfer({
      seqno,
      jettonWalletAddress,
      recipient,
      amountNano,
      payload,
      vault,
      excessesAccount: null,
      jettonTransferAmount: ONE_TON,
    });

    let [feeNano, isBattery] = await this.calcFee(
      boc,
      [setBalanceForEmulation(toNano('2'))], // Emulate with higher balance to calculate fair amount to send
    );

    return [Ton.fromNano(feeNano.toString()), isBattery];
  }

  async jettonTransfer(
    jettonWalletAddress: string,
    address: string,
    amountNano: string,
    unlockedVault: UnlockedVault,
    payload: Cell | string = '',
    sendWithBattery: boolean,
    forwardAmount: string,
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

    await tk.wallet.jettons.load();

    const balances = tk.wallet.jettons.state.data.jettonBalances;

    const balance = balances.find((jettonBalance) =>
      AddressFormatter.compare(jettonBalance.walletAddress, jettonWalletAddress),
    );

    if (
      !balance ||
      new BigNumber(toNano(balance.balance, balance.metadata.decimals ?? 9)).lt(
        new BigNumber(amountNano),
      )
    ) {
      throw new Error(t('send_insufficient_funds'));
    }

    const excessesAccount = sendWithBattery
      ? await tk.wallet.battery.getExcessesAccount()
      : tk.wallet.address.ton.raw;

    const boc = this.createJettonTransfer({
      seqno,
      jettonWalletAddress,
      recipient,
      amountNano,
      payload,
      vault: unlockedVault,
      secretKey: Buffer.from(secretKey),
      excessesAccount,
      jettonTransferAmount: BigInt(forwardAmount),
    });

    let feeNano: BigNumber;
    let isBattery = false;
    try {
      const [fee, battery] = await this.calcFee(boc);
      feeNano = fee;
      isBattery = battery;
    } catch (e) {
      throw new Error(t('send_fee_estimation_error'));
    }

    const transferAmount = feeNano.plus(BASE_FORWARD_AMOUNT.toString()).toString();

    if (this.isLockup()) {
      const lockupBalances = await this.getLockupBalances(sender);
      if (
        new BigNumber(lockupBalances[0]).minus(amountNano).isLessThan(-lockupBalances[1])
      ) {
        throw new Error(t('send_insufficient_funds'));
      }
    } else {
      if (!isBattery && new BigNumber(transferAmount).isGreaterThan(sender.balance)) {
        throw new Error(t('send_insufficient_funds'));
      }
    }

    try {
      await this.sendBoc(boc);
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

  async createTonTransfer({
    seqno,
    recipient,
    amount,
    payload = '',
    sendMode = 3,
    vault,
    bounce,
    walletVersion = null,
    secretKey = Buffer.alloc(64),
  }: TonTransferParams) {
    const version = vault.getVersion();
    const lockupConfig = vault.getLockupConfig();
    const contract = ContractService.getWalletContract(
      contractVersionsMap[walletVersion ?? version ?? 'v4R2'],
      Buffer.from(vault.tonPublicKey),
      vault.workchain,
      {
        lockupPubKey: lockupConfig?.config_pubkey,
        allowedDestinations: lockupConfig?.allowed_destinations,
      },
    );
    return TransactionService.createTransfer(contract, {
      seqno,
      secretKey,
      sendMode,
      messages: [
        internal({
          to: recipient.address,
          bounce,
          value: amount,
          body: payload !== '' ? payload : undefined,
        }),
      ],
    });
  }

  async estimateInscriptionFee(
    ticker: string,
    type: TypeEnum,
    address: string,
    amount: string,
    vault: Vault,
    payload: string = '',
  ) {
    const opTemplate = await this.tonapi.experimental.getInscriptionOpTemplate({
      destination: address,
      amount,
      who: tk.wallet.address.ton.raw,
      type,
      operation: OperationEnum.Transfer,
      comment: payload,
      ticker,
    });
    return this.estimateFee(
      opTemplate.destination,
      inscriptionTransferAmount,
      vault,
      opTemplate.comment,
      3,
    );
  }

  async estimateFee(
    address: string,
    amount: string,
    vault: Vault,
    payload: Cell | string = '',
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

    const boc = await this.createTonTransfer({
      seqno,
      recipient: recipientInfo,
      amount,
      payload,
      sendMode,
      vault,
      walletVersion,
      bounce: isActiveAccount(recipientInfo.status)
        ? AddressFormatter.isBounceable(address)
        : false,
    });

    const [feeNano, isBattery] = await this.calcFee(boc);

    return [Ton.fromNano(feeNano.toString()), isBattery];
  }

  async deploy(unlockedVault: UnlockedVault) {
    const wallet = unlockedVault.tonWallet;
    const secretKey = await unlockedVault.getTonPrivateKey();

    await wallet.deploy(secretKey).send();
  }

  async inscriptionTransfer(
    ticker: string,
    type: TypeEnum,
    address: string,
    amount: string,
    vault: UnlockedVault,
    payload: string = '',
  ) {
    const opTemplate = await this.tonapi.experimental.getInscriptionOpTemplate({
      destination: address,
      amount,
      who: tk.wallet.address.ton.raw,
      type,
      operation: OperationEnum.Transfer,
      comment: payload,
      ticker,
    });
    return this.transfer(
      opTemplate.destination,
      inscriptionTransferAmount,
      vault,
      opTemplate.comment,
      3,
    );
  }

  async transfer(
    address: string,
    amount: string,
    unlockedVault: UnlockedVault,
    payload: Cell | string = '',
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

    const boc = await this.createTonTransfer({
      seqno,
      recipient: recipientInfo,
      amount,
      payload,
      sendMode,
      vault: unlockedVault,
      walletVersion,
      secretKey: Buffer.from(secretKey),
      // We should keep bounce flag from user input. We should check contract status till Jan 1, 2024 according to internal Address reform roadmap
      bounce: isActiveAccount(recipientInfo.status)
        ? AddressFormatter.isBounceable(address)
        : false,
    });

    let feeNano: BigNumber;
    try {
      const [fee] = await this.calcFee(boc);
      feeNano = fee;
    } catch (e) {
      feeNano = new BigNumber('0');
      debugLog('[Transfer]: error estimate fee', e);
    }

    if (this.isLockup()) {
      const balances = await this.getLockupBalances(fromInfo);
      if (new BigNumber(balances[0]).minus(amount).isLessThan(-balances[1])) {
        throw new Error(t('send_insufficient_funds'));
      }
    } else if (sendMode !== 128) {
      if (new BigNumber(amountNano).plus(feeNano).isGreaterThan(fromInfo.balance)) {
        throw new Error(t('send_insufficient_funds'));
      }
    }

    try {
      await this.sendBoc(boc);
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

  async getTonPublicKey() {
    return this.vault.tonPublicKey;
  }

  async getPublicKeyByAddress(address: string): Promise<Buffer> {
    const { publicKey } = await this.accountsApi.getPublicKeyByAccountID({
      accountId: address,
    });
    return Buffer.from(publicKey, 'hex');
  }

  async getLockupBalances(info: Account) {
    try {
      if (['empty', 'uninit', 'nonexist'].includes(info?.status ?? '')) {
        const balance = (
          await this.blockchainApi.getRawAccount({ accountId: info.address })
        ).balance;
        return [Ton.fromNano(balance), 0, 0];
      }

      const balances = await this.vault.tonWallet.getBalances();
      const result = balances.map((item: number) => Ton.fromNano(item.toString()));
      result[0] = new BigNumber(result[0]).minus(result[1]).minus(result[2]).toString();

      return result;
    } catch (e) {
      if (e?.response?.status === 404) {
        return [Ton.fromNano('0'), 0, 0];
      }

      throw e;
    }
  }

  async getBalance(): Promise<string> {
    try {
      const account = await this.vault.getTonAddress(this.isTestnet);
      const balance = (await this.blockchainApi.getRawAccount({ accountId: account }))
        .balance;
      return Ton.fromNano(balance);
    } catch (e) {
      if (e?.response?.status === 404) {
        return Ton.fromNano(0);
      }

      throw e;
    }
  }
}
