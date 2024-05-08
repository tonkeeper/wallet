import { TonAPI } from '@tonkeeper/core/src/TonAPI';
import {
  WalletAddress,
  WalletConfig,
  WalletContractVersion,
  WalletNetwork,
  WalletType,
} from '../WalletTypes';
import { Address, AddressesByVersion } from '@tonkeeper/core/src/formatters/Address';
import {
  createBatteryApiInstance,
  createTonApiInstance,
  createTronApiInstance,
} from '../utils';
import { BatteryAPI } from '@tonkeeper/core/src/BatteryAPI';
import {
  ContractService,
  Storage,
  TronAPI,
  WalletContract,
  contractVersionsMap,
} from '@tonkeeper/core';
import { TronService } from '@tonkeeper/core/src/TronService';
import { NamespacedLogger, logger } from '$logger';

export class WalletBase {
  public identifier: string;
  public pubkey: string;
  public address: WalletAddress;
  protected persistPath: string;

  public tronService: TronService;

  public tonapi: TonAPI;
  protected batteryapi: BatteryAPI;
  protected tronapi: TronAPI;

  protected logger: NamespacedLogger;

  public contract: WalletContract;

  constructor(
    public config: WalletConfig,
    public tonAllAddresses: AddressesByVersion,
    protected storage: Storage,
  ) {
    this.identifier = config.identifier;
    this.persistPath = this.identifier;
    this.pubkey = config.pubkey;

    this.contract = ContractService.getWalletContract(
      contractVersionsMap[config.version],
      Buffer.from(this.pubkey, 'hex'),
      config.workchain,
      {
        lockupPubKey: config.configPubKey,
        allowedDestinations: config.allowedDestinations,
      },
    );

    const tonAddress = Address.parse(this.tonAllAddresses[config.version].raw, {
      bounceable: false,
    }).toAll({
      testOnly: config.network === WalletNetwork.testnet,
    });

    this.address = {
      tron: { proxy: '', owner: '' },
      ton: tonAddress,
    };

    this.logger = logger.extend(`Wallet ${this.address.ton.short}`);

    this.tonapi = createTonApiInstance(this.isTestnet);
    this.batteryapi = createBatteryApiInstance(this.isTestnet);
    this.tronapi = createTronApiInstance(this.isTestnet);

    this.tronService = new TronService(this.address, this.tronapi);
  }

  public setConfig(config: WalletConfig) {
    this.config = config;
  }

  public isV4() {
    return this.config.version === WalletContractVersion.v4R2;
  }

  public get isLockup() {
    return this.config.version === WalletContractVersion.LockupV1;
  }

  public get isTestnet() {
    return this.config.network === WalletNetwork.testnet;
  }

  public get isWatchOnly() {
    return this.config.type === WalletType.WatchOnly;
  }

  public get isLedger() {
    return this.config.type === WalletType.Ledger;
  }

  public get isSigner() {
    return (
      this.config.type === WalletType.Signer ||
      this.config.type === WalletType.SignerDeeplink
    );
  }

  public get isExternal() {
    return this.isSigner || this.isLedger;
  }

  public getLockupConfig() {
    return {
      wallet_type: this.config.version,
      workchain: this.config.workchain,
      config_pubkey: this.config.configPubKey,
      allowed_destinations: this.config.allowedDestinations,
    };
  }

  public async getWalletInfo() {
    return await this.tonapi.accounts.getAccount(this.address.ton.raw);
  }

  protected async rehydrate() {}
}
