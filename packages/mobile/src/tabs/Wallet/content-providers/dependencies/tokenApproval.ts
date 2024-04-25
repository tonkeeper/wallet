import { DependencyPrototype } from './utils/prototype';
import { tk } from '$wallet';

import {
  TokenApprovalState,
  TokenApprovalStatus,
} from '$wallet/managers/TokenApprovalManager';
import { CellItemToRender } from '../utils/types';

export class TokenApprovalDependency extends DependencyPrototype<
  TokenApprovalState,
  Pick<TokenApprovalState, 'tokens' | 'pinned'>
> {
  constructor() {
    super(tk.wallet.tokenApproval.state, (state) => ({
      tokens: state.tokens,
      pinned: state.pinned,
    }));
  }

  setWallet(wallet) {
    this.dataProvider = wallet.tokenApproval.state;
    super.setWallet(wallet);
  }

  get filterAssetFn(): (asset: CellItemToRender) => boolean {
    return (asset: CellItemToRender) => {
      const status = this.state.tokens[asset.key];
      if (asset._isHiddenByDefault) {
        return status && status.current === TokenApprovalStatus.Approved;
      }

      return !status || status.current !== TokenApprovalStatus.Declined;
    };
  }

  getPinnedIndex(identifier: string) {
    return this.state.pinned[identifier] ?? false;
  }
}
