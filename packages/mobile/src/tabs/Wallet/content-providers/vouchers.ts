import { ContentProviderPrototype } from './utils/prototype';
import { CellItemToRender } from './utils/types';
import { formatter } from '@tonkeeper/shared/formatter';
import { Providers } from './providers';
import { TonBalanceType } from './dependencies/tonBalances';
import { NotCoinVouchersDependency } from './dependencies/notcoinVouchers';
import { JettonBalancesDependency } from './dependencies/jettons';
import { NftItem } from '@tonkeeper/core/src/TonAPI';
import { t } from '@tonkeeper/shared/i18n';
import { TonPriceDependency } from './dependencies/tonPrice';
import { config } from '$config';
import { openVouchers } from '$navigation';

export const mappedTonBalanceTitle = {
  [TonBalanceType.Liquid]: 'Toncoin',
  [TonBalanceType.Locked]: 'Locked Toncoin',
  [TonBalanceType.Restricted]: 'Restricted Toncoin',
};

export class VouchersContentProvider extends ContentProviderPrototype<{
  tonPrice: TonPriceDependency;
  jettonBalances: JettonBalancesDependency;
  vouchers: NotCoinVouchersDependency;
}> {
  name = Providers.NotCoinVouchers;
  renderPriority = 998;

  constructor(
    tonPrice: TonPriceDependency,
    jettonBalances: JettonBalancesDependency,
    vouchers: NotCoinVouchersDependency,
  ) {
    super({ tonPrice, jettonBalances, vouchers });
  }

  get itemsArray() {
    if (!config.get('notcoin_burn')) {
      return [];
    }

    return this.deps.vouchers.state.length > 0
      ? [{ nfts: this.deps.vouchers.state }]
      : [];
  }

  makeCellItemFromData(data: { nfts: NftItem[] }): CellItemToRender {
    const totalValue = data.nfts.reduce(
      (acc, nft) =>
        acc + parseInt(nft.metadata!.attributes[0].value.replace(',', '') ?? '0', 10),
      0,
    );

    const fiatRate = this.deps.jettonBalances.getJettonRate(
      config.get('notcoin_jetton_master'),
      String(totalValue),
      this.deps.tonPrice.state.currency,
    );

    return {
      key: 'notcoin-vouchers',
      renderPriority: this.renderPriority,
      title: t('notcoin.not_vouchers'),
      onPress: openVouchers,
      fiatRate,
      picture:
        'https://cache.tonapi.io/imgproxy/4KCMNm34jZLXt0rqeFm4rH-BK4FoK76EVX9r0cCIGDg/rs:fill:200:200:1/g:no/aHR0cHM6Ly9jZG4uam9pbmNvbW11bml0eS54eXovY2xpY2tlci9ub3RfbG9nby5wbmc.webp',
      value: formatter.format(totalValue, { withoutTruncate: true }),
    };
  }
}
