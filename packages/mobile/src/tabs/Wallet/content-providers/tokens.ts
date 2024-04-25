import { ContentProviderPrototype } from './utils/prototype';
import { CellItemToRender } from './utils/types';
import { formatter } from '$utils/formatter';
import { JettonBalanceModel } from '$wallet/models/JettonBalanceModel';
import { openJetton } from '$navigation';
import { Providers } from './providers';
import { TonPriceDependency } from './dependencies/tonPrice';
import { StakingJettonsDependency } from './dependencies/stakingJettons';
import { JettonBalancesDependency } from './dependencies/jettons';
import { config } from '$config';
import { JettonVerification } from '$store/models';
import { t } from '@tonkeeper/shared/i18n';
import { Steezy } from '$styles';
import { Address, TETHER_JETTON_MASTER } from '@tonkeeper/core';

export class TokensContentProvider extends ContentProviderPrototype<{
  tonPrice: TonPriceDependency;
  stakingJettons: StakingJettonsDependency;
  jettonBalances: JettonBalancesDependency;
}> {
  name = Providers.Tokens;
  renderPriority = 0;

  constructor(
    private isEditableMode: boolean,
    tonPrice: TonPriceDependency,
    stakingJettons: StakingJettonsDependency,
    jettonBalances: JettonBalancesDependency,
  ) {
    super({
      tonPrice,
      stakingJettons,
      jettonBalances,
    });
  }

  get itemsArray() {
    return this.deps.jettonBalances.state.jettonBalances.filter((jettonBalance) =>
      [this.deps.stakingJettons.filterTokensBalancesFn].every((filterFn) =>
        filterFn(jettonBalance),
      ),
    );
  }

  makeCellItemFromData(data: JettonBalanceModel): CellItemToRender {
    const fiatRate = this.deps.jettonBalances.getJettonRate(
      data.jettonAddress,
      data.balance,
      this.deps.tonPrice.state.currency,
    );
    const isUnverifiedToken =
      !config.get('disable_show_unverified_token') &&
      data.verification === JettonVerification.NONE;

    const subtitle = isUnverifiedToken
      ? t('approval.unverified_token')
      : this.isEditableMode
      ? formatter.format(data.balance, { currency: data.metadata.symbol })
      : undefined;

    return {
      key: Address.parse(data.jettonAddress).toRaw(),
      tag:
        Address.parse(data.jettonAddress).toRaw() === TETHER_JETTON_MASTER
          ? 'TON'
          : undefined,
      _isHiddenByDefault: data.verification === JettonVerification.BLACKLIST,
      renderPriority: isUnverifiedToken ? -1 : this.renderPriority,
      title: data.metadata.symbol ?? '',
      onPress: () => openJetton(data.jettonAddress),
      fiatRate,
      picture: data.metadata.image,
      value: formatter.format(data.balance),
      subtitleStyle: isUnverifiedToken && styles.unverifiedSubtitleStyle,
      subtitle,
    };
  }
}

const styles = Steezy.create(({ colors }) => ({
  unverifiedSubtitleStyle: {
    color: colors.accentOrange,
  },
}));
