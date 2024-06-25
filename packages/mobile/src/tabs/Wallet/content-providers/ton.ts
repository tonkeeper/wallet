import { ContentProviderPrototype } from './utils/prototype';
import { CellItemToRender } from './utils/types';
import { formatter } from '@tonkeeper/shared/formatter';
import { openWallet } from '$core/Wallet/ToncoinScreen';
import { CryptoCurrencies } from '$shared/constants';
import { Providers } from './providers';
import { TonPriceDependency } from './dependencies/tonPrice';
import {
  TonBalancesDependency,
  TonBalanceType,
  TonBalance,
} from './dependencies/tonBalances';

export const mappedTonBalanceTitle = {
  [TonBalanceType.Liquid]: 'Toncoin',
  [TonBalanceType.Locked]: 'Locked Toncoin',
  [TonBalanceType.Restricted]: 'Restricted Toncoin',
};

export const mappedRenderPriority = {
  [TonBalanceType.Liquid]: 1001,
  [TonBalanceType.Locked]: 1000,
  [TonBalanceType.Restricted]: 999,
};

export class TONContentProvider extends ContentProviderPrototype<{
  tonPrice: TonPriceDependency;
  tonBalances: TonBalancesDependency;
}> {
  name = Providers.TON;

  constructor(tonPrice: TonPriceDependency, tonBalances: TonBalancesDependency) {
    super({ tonPrice, tonBalances });
  }

  get itemsArray() {
    return this.deps.tonBalances.balances;
  }

  makeCellItemFromData(data: TonBalance): CellItemToRender {
    return {
      key: data.type,
      renderPriority: mappedRenderPriority[data.type],
      tonIcon: true,
      fiatRate: this.deps.tonPrice.getFiatRate(data.balance),
      onPress: () => openWallet(CryptoCurrencies.Ton),
      title: mappedTonBalanceTitle[data.type],
      value: formatter.format(data.balance),
    };
  }
}
