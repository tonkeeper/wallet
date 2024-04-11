import { ContentProviderPrototype } from './utils/prototype';
import { CellItemToRender } from './utils/types';
import { formatter } from '@tonkeeper/shared/formatter';
import { openWallet } from '$core/Wallet/ToncoinScreen';
import { CryptoCurrencies } from '$shared/constants';
import { Providers } from './providers';
import { TonPriceDependency } from './dependencies/tonPrice';
import { TonBalancesDependency } from './dependencies/tonBalances';

export enum TonBalanceType {
  Liquid = 'Liquid',
  Locked = 'Locked',
  Restricted = 'Restricted',
}

export type TonBalance = {
  type: TonBalanceType;
  balance: string;
};

export const mappedTonBalanceTitle = {
  [TonBalanceType.Liquid]: 'Toncoin',
  [TonBalanceType.Locked]: 'Locked Toncoin',
  [TonBalanceType.Restricted]: 'Restricted Toncoin',
};

export class TONContentProvider extends ContentProviderPrototype<{
  tonPrice: TonPriceDependency;
  balances: TonBalancesDependency;
}> {
  name = Providers.TON;
  renderPriority = 999;

  constructor(tonPrice: TonPriceDependency, balances: TonBalancesDependency) {
    super({ tonPrice, balances });
  }

  get itemsArray() {
    const balances: TonBalance[] = [
      { type: TonBalanceType.Liquid, balance: this.deps.balances.state.ton },
    ];

    if (this.wallet.isLockup) {
      balances.push(
        { type: TonBalanceType.Locked, balance: this.deps.balances.state.tonLocked },
        {
          type: TonBalanceType.Restricted,
          balance: this.deps.balances.state.tonRestricted,
        },
      );
    }

    return balances;
  }

  makeCellItemFromData(data: TonBalance): CellItemToRender {
    return {
      key: data.type,
      renderPriority: this.renderPriority,
      tonIcon: true,
      fiatRate: this.deps.tonPrice.getFiatRate(data.balance),
      onPress: () => openWallet(CryptoCurrencies.Ton),
      title: mappedTonBalanceTitle[data.type],
      value: formatter.format(data.balance),
    };
  }
}
