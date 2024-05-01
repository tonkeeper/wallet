import { ContentProviderPrototype } from './utils/prototype';
import { CellItemToRender } from './utils/types';
import { formatter } from '@tonkeeper/shared/formatter';
import { Providers } from './providers';
import { InscriptionBalance } from '@tonkeeper/core/src/TonAPI';
import { InscriptionsDependency } from './dependencies/inscriptions';
import { openTonInscription } from '$navigation';
import { DEFAULT_TOKEN_LOGO } from '@tonkeeper/uikit';
import { TonPriceDependency } from './dependencies/tonPrice';
import { TokenApprovalDependency } from './dependencies/tokenApproval';

export class InscriptionsContentProvider extends ContentProviderPrototype<{
  inscriptions: InscriptionsDependency;
  tonPrice: TonPriceDependency;
  approval: TokenApprovalDependency;
}> {
  name = Providers.Inscriptions;
  renderPriority = -2;

  constructor(
    tonPrice: TonPriceDependency,
    inscriptions: InscriptionsDependency,
    approval: TokenApprovalDependency,
  ) {
    super({
      inscriptions,
      tonPrice,
      approval,
    });
  }

  private filterByTokenApproval(inscriptions: InscriptionBalance[]) {
    return inscriptions.filter(this.deps.approval.filterInscriptionsFn);
  }

  get itemsArray() {
    return this.filterByTokenApproval(this.deps.inscriptions.state);
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
          in_ton: '0',
          formatted: formatter.format(0, {
            currency: this.deps.tonPrice.state.currency,
          }),
          raw: '0',
        },
        percent: '',
      },
      value: formatter.formatNano(data.balance, { decimals: data.decimals }),
    };
  }
}
