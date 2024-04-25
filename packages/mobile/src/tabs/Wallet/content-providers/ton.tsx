import { ContentProviderPrototype } from './utils/prototype';
import { CellItemToRender } from './utils/types';
import { formatter } from '@tonkeeper/shared/formatter';
import { openWallet } from '$core/Wallet/ToncoinScreen';
import { CryptoCurrencies } from '$shared/constants';
import { Providers } from './providers';
import { TonPriceDependency } from './dependencies/tonPrice';
import {
  TonBalance,
  TonBalancesDependency,
  TonBalanceType,
} from './dependencies/tonBalances';
import { TonIcon } from '@tonkeeper/uikit';

export const mappedTonBalanceTitle = {
  [TonBalanceType.Liquid]: 'Toncoin',
  [TonBalanceType.Locked]: 'Locked Toncoin',
  [TonBalanceType.Restricted]: 'Restricted Toncoin',
};

export class TONContentProvider extends ContentProviderPrototype<{
  tonPrice: TonPriceDependency;
  tonBalances: TonBalancesDependency;
}> {
  name = Providers.TON;
  renderPriority = 999;

  constructor(
    private isEditableMode: boolean,
    tonPrice: TonPriceDependency,
    tonBalances: TonBalancesDependency,
  ) {
    super({ tonPrice, tonBalances });
  }

  get itemsArray() {
    if (this.isEditableMode) {
      return [];
    }
    return this.deps.tonBalances.balances;
  }

  makeCellItemFromData(data: TonBalance): CellItemToRender {
    const isLocked = data.type !== TonBalanceType.Liquid;
    return {
      key: data.type,
      renderPriority: this.renderPriority,
      fiatRate: this.deps.tonPrice.getFiatRate(data.balance),
      onPress: () => openWallet(CryptoCurrencies.Ton),
      renderIcon: () => <TonIcon locked={isLocked} showDiamond={!isLocked} />,
      title: mappedTonBalanceTitle[data.type],
      value: formatter.format(data.balance),
    };
  }
}
