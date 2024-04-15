import { DependencyPrototype } from './utils/prototype';
import { tk } from '$wallet';

import {
  TokenApprovalState,
  TokenApprovalStatus,
} from '$wallet/managers/TokenApprovalManager';
import { Address } from '@tonkeeper/shared/Address';
import {
  JettonBalanceModel,
  JettonVerification,
} from '$wallet/models/JettonBalanceModel';

export class TokenApprovalDependency extends DependencyPrototype<
  TokenApprovalState,
  Pick<TokenApprovalState, 'tokens'>
> {
  constructor() {
    super(tk.wallet.tokenApproval.state, (state) => ({ tokens: state.tokens }));
  }

  setWallet(wallet) {
    this.dataProvider = wallet.tokenApproval.state;
    super.setWallet(wallet);
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
