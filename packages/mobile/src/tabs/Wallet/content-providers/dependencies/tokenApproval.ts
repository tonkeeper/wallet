import { DependencyPrototype } from './utils/prototype';

import {
  TokenApprovalState,
  TokenApprovalStatus,
} from '$wallet/managers/TokenApprovalManager';
import { Address } from '@tonkeeper/shared/Address';
import {
  JettonBalanceModel,
  JettonVerification,
} from '$wallet/models/JettonBalanceModel';
import { InscriptionBalance } from '@tonkeeper/core/src/TonAPI';
import { Wallet } from '$wallet/Wallet';

export class TokenApprovalDependency extends DependencyPrototype<
  TokenApprovalState,
  Pick<TokenApprovalState, 'tokens'>
> {
  constructor(wallet: Wallet) {
    super(wallet.tokenApproval.state, (state) => ({ tokens: state.tokens }));
  }

  get filterInscriptionsFn(): (balance: InscriptionBalance) => boolean {
    return (balance: InscriptionBalance) => {
      const key = balance.ticker + '_' + balance.type;
      const approvalStatus = this.state.tokens[key];

      return !approvalStatus || approvalStatus.current !== TokenApprovalStatus.Declined;
    };
  }

  get filterTokensBalancesFn(): (balance: JettonBalanceModel) => boolean {
    return (balance: JettonBalanceModel) => {
      const jettonAddress = Address.parse(balance.jettonAddress).toRaw();
      const approvalStatus = this.state.tokens[jettonAddress];
      const isBlacklisted = balance.verification === JettonVerification.BLACKLIST;

      if (isBlacklisted) {
        return approvalStatus?.current === TokenApprovalStatus.Approved;
      }

      return !approvalStatus || approvalStatus.current !== TokenApprovalStatus.Declined;
    };
  }
}
