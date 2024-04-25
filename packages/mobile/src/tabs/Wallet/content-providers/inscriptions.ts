import { ContentProviderPrototype } from './utils/prototype';
import { CellItemToRender } from './utils/types';
import { formatter } from '@tonkeeper/shared/formatter';
import { Providers } from './providers';
import { InscriptionBalance } from '@tonkeeper/core/src/TonAPI';
import { InscriptionsDependency } from './dependencies/inscriptions';
import { openTonInscription } from '$navigation';
import { DEFAULT_TOKEN_LOGO } from '@tonkeeper/uikit';
import { TonPriceDependency } from './dependencies/tonPrice';

export class InscriptionsContentProvider extends ContentProviderPrototype<{
  inscriptions: InscriptionsDependency;
  tonPrice: TonPriceDependency;
}> {
  name = Providers.Inscriptions;
  renderPriority = -2;

  constructor(
    private isEditableMode: boolean,
    tonPrice: TonPriceDependency,
    inscriptions: InscriptionsDependency,
  ) {
    super({
      inscriptions,
      tonPrice,
    });
  }

  get itemsArray() {
    return this.deps.inscriptions.state;
  }

  makeCellItemFromData(data: InscriptionBalance): CellItemToRender {
    return {
      key: data.ticker + '_' + data.type,
      renderPriority: this.renderPriority,
      onPress: () => openTonInscription({ ticker: data.ticker, type: data.type }),
      title: data.ticker,
      tag: data.type,
      picture: DEFAULT_TOKEN_LOGO,
      fiatRate: {
        price: {
          formatted: formatter.format(0, {
            currency: this.deps.tonPrice.state.currency,
          }),
          raw: '0',
        },
        trend: 'negative',
        total: {
          formatted: formatter.format(0, {
            currency: this.deps.tonPrice.state.currency,
          }),
          raw: '0',
        },
        percent: '',
      },
      subtitle: this.isEditableMode
        ? formatter.formatNano(data.balance, {
            decimals: data.decimals,
            currency: data.ticker,
          })
        : undefined,
      value: formatter.formatNano(data.balance, { decimals: data.decimals }),
    };
  }
}
