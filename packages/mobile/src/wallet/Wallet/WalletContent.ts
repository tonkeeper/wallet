import { Address, AddressesByVersion } from '@tonkeeper/core/src/formatters/Address';

import { ActivityList } from '../Activity/ActivityList';
import { NftsManager } from '../managers/NftsManager';
import { SubscriptionsManager } from '../managers/SubscriptionsManager';

import { BalancesManager } from '../managers/BalancesManager';
import { ActivityLoader } from '../Activity/ActivityLoader';
import { TonActivityList } from '../Activity/TonActivityList';
import { JettonActivityList } from '../Activity/JettonActivityList';
import { TonInscriptions } from '../managers/TonInscriptions';
import { JettonsManager } from '../managers/JettonsManager';
import { Storage } from '@tonkeeper/core/src/declarations/Storage';
import { TokenApprovalManager } from '../managers/TokenApprovalManager';
import { TonPriceManager } from '../managers/TonPriceManager';
import { StakingManager } from '../managers/StakingManager';
import { WalletConfig } from '../WalletTypes';
import { WalletBase } from './WalletBase';
import BigNumber from 'bignumber.js';
import { BatteryManager } from '../managers/BatteryManager';

export interface WalletStatusState {
  isReloading: boolean;
  isLoading: boolean;
  updatedAt: number;
}

export class WalletContent extends WalletBase {
  public subscriptions: SubscriptionsManager;
  public balances: BalancesManager;
  public battery: BatteryManager;
  public nfts: NftsManager;
  public jettons: JettonsManager;
  public tokenApproval: TokenApprovalManager;
  public staking: StakingManager;
  public activityLoader: ActivityLoader;
  public jettonActivityList: JettonActivityList;
  public tonActivityList: TonActivityList;
  public activityList: ActivityList;
  public tonInscriptions: TonInscriptions;

  constructor(
    public config: WalletConfig,
    public tonAllAddresses: AddressesByVersion,
    protected storage: Storage,
    protected tonPrice: TonPriceManager,
  ) {
    super(config, tonAllAddresses, storage);

    const tonRawAddress = this.address.ton.raw;

    this.subscriptions = new SubscriptionsManager(tonRawAddress);

    this.activityLoader = new ActivityLoader(tonRawAddress, this.tonapi, this.tronapi);
    this.jettonActivityList = new JettonActivityList(
      tonRawAddress,
      this.activityLoader,
      this.storage,
    );
    this.tonActivityList = new TonActivityList(
      tonRawAddress,
      this.activityLoader,
      this.storage,
    );
    this.activityList = new ActivityList(
      tonRawAddress,
      this.activityLoader,
      this.storage,
    );
    this.tonInscriptions = new TonInscriptions(tonRawAddress, this.tonapi, this.storage);
    this.balances = new BalancesManager(
      tonRawAddress,
      this.tonAllAddresses,
      this.isLockup,
      this.tonapi,
      this.storage,
    );
    this.nfts = new NftsManager(
      tonRawAddress,
      this.tonAllAddresses,
      this.tonapi,
      this.storage,
    );
    this.tokenApproval = new TokenApprovalManager(tonRawAddress, this.storage);
    this.jettons = new JettonsManager(
      tonRawAddress,
      this.tonPrice,
      this.tokenApproval,
      this.tonapi,
      this.storage,
    );
    this.staking = new StakingManager(
      tonRawAddress,
      this.jettons,
      this.tonapi,
      this.storage,
    );
    this.battery = new BatteryManager(this.batteryapi, this.tonProof, this.storage);
  }

  protected async rehydrate() {
    await super.rehydrate();

    this.jettonActivityList.rehydrate();
    this.tonActivityList.rehydrate();
    this.activityList.rehydrate();
    this.tokenApproval.rehydrate();
    this.balances.rehydrate();
    this.jettons.rehydrate();
    this.staking.rehydrate();
    this.nfts.rehydrate();
  }

  protected async preload() {
    await Promise.all([
      this.balances.load(),
      this.jettons.load(),
      this.activityList.load(),
      this.tonInscriptions.load(),
      this.subscriptions.prefetch(),
      this.nfts.load(),
      this.staking.load(),
    ]);
  }

  public async reload() {
    await Promise.all([
      this.balances.load(),
      this.jettons.reload(),
      this.nfts.reload(),
      this.staking.reload(),
      this.activityList.reload(),
      this.tonInscriptions.load(),
    ]);
  }

  public get totalFiat() {
    const ton = new BigNumber(this.balances.state.data.ton).multipliedBy(
      this.tonPrice.state.data.ton.fiat,
    );
    const jettons = this.jettons.state.data.jettonBalances.reduce((total, jetton) => {
      const rate =
        this.jettons.state.data.jettonRates[Address.parse(jetton.jettonAddress).toRaw()];
      return rate
        ? total.plus(new BigNumber(jetton.balance).multipliedBy(rate.fiat))
        : total;
    }, new BigNumber(0));
    const staking = new BigNumber(this.staking.state.data.stakingBalance).multipliedBy(
      this.tonPrice.state.data.ton.fiat,
    );
    return ton.plus(jettons).plus(staking).toString();
  }
}
