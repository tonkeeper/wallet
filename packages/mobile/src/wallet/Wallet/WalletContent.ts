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
import {
  TokenApprovalManager,
  TokenApprovalStatus,
} from '../managers/TokenApprovalManager';
import { TonPriceManager } from '../managers/TonPriceManager';
import { StakingManager } from '../managers/StakingManager';
import { WalletConfig } from '../WalletTypes';
import { WalletBase } from './WalletBase';
import BigNumber from 'bignumber.js';
import { BatteryManager } from '../managers/BatteryManager';
import { NotificationsManager } from '../managers/NotificationsManager';
import { TonProofManager } from '../managers/TonProofManager';
import { JettonVerification } from '../models/JettonBalanceModel';
import { CardsManager } from '$wallet/managers/CardsManager';
import { JettonQuantity } from '@tonkeeper/core/src/TonAPI';
import { WalletContentReceiver } from '../../tabs/Wallet/content-providers/utils/receiver';
import { SignerManager } from '$wallet/managers/SignerManager';

export interface WalletStatusState {
  isReloading: boolean;
  isLoading: boolean;
  updatedAt: number;
}

export class WalletContent extends WalletBase {
  public activityLoader: ActivityLoader;
  public tonProof: TonProofManager;
  public tokenApproval: TokenApprovalManager;
  public balances: BalancesManager;
  public nfts: NftsManager;
  public jettons: JettonsManager;
  public tonInscriptions: TonInscriptions;
  public staking: StakingManager;
  public subscriptions: SubscriptionsManager;
  public battery: BatteryManager;
  public notifications: NotificationsManager;
  public activityList: ActivityList;
  public tonActivityList: TonActivityList;
  public jettonActivityList: JettonActivityList;
  public cards: CardsManager;
  public signer: SignerManager;

  constructor(
    public config: WalletConfig,
    public tonAllAddresses: AddressesByVersion,
    protected storage: Storage,
    protected tonPrice: TonPriceManager,
  ) {
    super(config, tonAllAddresses, storage);

    const tonRawAddress = this.address.ton.raw;

    this.activityLoader = new ActivityLoader(tonRawAddress, this.tonapi, this.tronapi);

    this.tonProof = new TonProofManager(this.identifier, this.tonapi);
    this.tokenApproval = new TokenApprovalManager(this.persistPath, this.storage);
    this.balances = new BalancesManager(
      this.persistPath,
      tonRawAddress,
      this.config,
      this.tonapi,
      this.storage,
    );
    this.jettons = new JettonsManager(
      this.persistPath,
      tonRawAddress,
      this.tonPrice,
      this.tokenApproval,
      this.tonapi,
      this.storage,
    );
    this.nfts = new NftsManager(
      this.persistPath,
      tonRawAddress,
      this.tonapi,
      this.storage,
      this.jettons,
    );
    this.tonInscriptions = new TonInscriptions(
      this.persistPath,
      tonRawAddress,
      this.tonapi,
      this.storage,
    );
    this.staking = new StakingManager(
      this.persistPath,
      tonRawAddress,
      this.jettons,
      this.tonapi,
      this.storage,
    );
    this.subscriptions = new SubscriptionsManager(
      this.persistPath,
      tonRawAddress,
      this.storage,
    );
    this.battery = new BatteryManager(
      this.persistPath,
      this.tonProof,
      this.batteryapi,
      this.storage,
      this.isTestnet,
    );
    this.cards = new CardsManager(
      this.persistPath,
      tonRawAddress,
      this.isTestnet,
      this.storage,
    );
    this.notifications = new NotificationsManager(
      this.persistPath,
      tonRawAddress,
      this.isTestnet,
      this.storage,
      this.logger,
    );
    this.activityList = new ActivityList(
      this.persistPath,
      this.activityLoader,
      this.storage,
    );
    this.tonActivityList = new TonActivityList(
      this.persistPath,
      this.activityLoader,
      this.storage,
    );
    this.jettonActivityList = new JettonActivityList(
      this.persistPath,
      this.activityLoader,
      this.storage,
    );
    this.signer = new SignerManager(tonRawAddress, this.tonapi, this.config);
  }

  protected async rehydrate() {
    await super.rehydrate();

    /*
      Tonproof token must exist when we call preload,
      so we have to resolve promise here
     */
    await this.tonProof.rehydrate();
    this.tokenApproval.rehydrate();
    this.balances.rehydrate();
    this.nfts.rehydrate();
    this.jettons.rehydrate();
    this.tonInscriptions.rehydrate();
    this.staking.rehydrate();
    this.subscriptions.rehydrate();
    this.battery.rehydrate();
    this.notifications.rehydrate();
    this.activityList.rehydrate();
    this.tonActivityList.rehydrate();
    this.jettonActivityList.rehydrate();
    this.cards.rehydrate();
  }

  protected async preload() {
    await Promise.all([
      this.balances.load(),
      this.nfts.load(),
      this.jettons.load(),
      this.tonInscriptions.load(),
      this.staking.load(),
      this.subscriptions.load(),
      this.battery.load(),
      this.activityList.load(),
      this.cards.load(),
    ]);
  }

  public async reload() {
    await Promise.all([
      this.balances.reload(),
      this.nfts.reload(),
      this.jettons.reload(),
      this.tonInscriptions.load(),
      this.staking.reload(),
      this.subscriptions.reload(),
      this.battery.load(),
      this.activityList.reload(),
      this.cards.load(),
    ]);
  }

  public get totalTon() {
    const ton = new BigNumber(this.balances.state.data.ton).multipliedBy(
      this.tonPrice.state.data.ton.fiat,
    );
    const jettons = this.jettons.state.data.jettonBalances.reduce((total, jetton) => {
      const isBlacklisted = jetton.verification === JettonVerification.BLACKLIST;
      const approvalStatus =
        this.tokenApproval.state.data.tokens[Address.parse(jetton.jettonAddress).toRaw()];
      if (
        (isBlacklisted && !approvalStatus) ||
        approvalStatus?.current === TokenApprovalStatus.Declined
      ) {
        return total;
      }
      const rate =
        this.jettons.state.data.jettonRates[Address.parse(jetton.jettonAddress).toRaw()];

      return rate
        ? total.plus(new BigNumber(jetton.balance).multipliedBy(rate.ton))
        : total;
    }, new BigNumber(0));
    const staking = new BigNumber(this.staking.state.data.stakingBalance).multipliedBy(
      this.tonPrice.state.data.ton.fiat,
    );
    return ton.plus(jettons).plus(staking).toString();
  }

  public get totalFiat() {
    const ton = new BigNumber(this.balances.state.data.ton).multipliedBy(
      this.tonPrice.state.data.ton.fiat,
    );
    const jettons = this.jettons.state.data.jettonBalances.reduce((total, jetton) => {
      const isBlacklisted = jetton.verification === JettonVerification.BLACKLIST;
      const approvalStatus =
        this.tokenApproval.state.data.tokens[Address.parse(jetton.jettonAddress).toRaw()];
      if (
        (isBlacklisted && !approvalStatus) ||
        approvalStatus?.current === TokenApprovalStatus.Declined
      ) {
        return total;
      }
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

  public compareWithTotal(tonBalance: number, jettonBalances: JettonQuantity[]) {
    const ton = new BigNumber(tonBalance)
      .shiftedBy(-9)
      .multipliedBy(this.tonPrice.state.data.ton.fiat);
    const jettons = jettonBalances.reduce((total, jetton) => {
      const rate =
        this.jettons.state.data.jettonRates[Address.parse(jetton.jetton.address).toRaw()];

      const decimalQuantity = new BigNumber(jetton.quantity).shiftedBy(
        -(jetton.jetton.decimals ?? 9),
      );
      return rate
        ? total.plus(new BigNumber(decimalQuantity).multipliedBy(rate.fiat))
        : total;
    }, new BigNumber(0));

    const total = ton.plus(jettons);

    const diff = total.div(this.totalFiat);
    return {
      totalFiat: total.toString(),
      isDangerous: diff.isGreaterThanOrEqualTo('0.2'),
    };
  }
}
