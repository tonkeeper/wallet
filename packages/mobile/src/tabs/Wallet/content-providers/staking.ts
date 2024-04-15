import { ContentProviderPrototype } from './utils/prototype';
import { CellItemToRender } from './utils/types';
import { formatter } from '@tonkeeper/shared/formatter';
import { Providers } from './providers';
import { StakingWidgetStatus } from '../components/StakingWidgetStatus';
import {
  AccountStakingInfo,
  PoolImplementationType,
  PoolInfo,
} from '@tonkeeper/core/src/TonAPI';
import { TonPriceDependency } from './dependencies/tonPrice';
import { JettonBalancesDependency } from './dependencies/jettons';
import { Address } from '@tonkeeper/shared/Address';
import { StakingDependency } from './dependencies/staking';

export class StakingContentProvider extends ContentProviderPrototype<{
  tonPrice: TonPriceDependency;
  jettonBalances: JettonBalancesDependency;
  staking: StakingDependency;
}> {
  name = Providers.Staking;
  renderPriority = 0;

  constructor(
    tonPrice: TonPriceDependency,
    jettonBalances: JettonBalancesDependency,
    staking: StakingDependency,
  ) {
    super({
      tonPrice,
      jettonBalances,
      staking,
    });
  }

  private getRate(pool: PoolInfo, info: AccountStakingInfo) {
    const jettonBalance = this.deps.jettonBalances.state.jettonBalances.find(
      (balance) =>
        Address.parse(balance.jettonAddress).toRaw() === pool.liquid_jetton_master,
    );

    if (jettonBalance) {
      return this.deps.jettonBalances.getJettonRate(
        jettonBalance.jettonAddress,
        jettonBalance.balance,
        this.deps.tonPrice.state.currency,
      );
    }

    return this.deps.tonPrice.getFiatRate(formatter.fromNano(info.amount).toString());
  }

  get itemsArray() {
    return this.deps.staking.state.filter((item) => {
      const info = item.info;
      if (info) {
        return true;
      }

      if ([PoolImplementationType.LiquidTF].includes(item.pool.implementation)) {
        const stakingJetton = this.deps.jettonBalances.state.jettonBalances.find(
          (jettonBalance) =>
            Address.parse(jettonBalance.jettonAddress).toRaw() ===
            item.pool.liquid_jetton_master,
        );
        return stakingJetton && stakingJetton.balance !== '0';
      }
    });
  }

  makeCellItemFromData(data: {
    info: AccountStakingInfo;
    pool: PoolInfo;
  }): CellItemToRender {
    return {
      renderPriority: this.renderPriority,
      RenderComponent: StakingWidgetStatus,
      passProps: {
        poolStakingInfo: data.info,
        pool: data.pool,
      },
      fiatRate: this.getRate(data.pool, data.info),
      key: data.pool.address,
      title: 'string',
      subtitle: 'subtitle',
      value: data.info && formatter.formatNano(data.info.amount),
    };
  }
}
