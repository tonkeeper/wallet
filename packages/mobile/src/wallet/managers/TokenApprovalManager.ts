import { Storage } from '@tonkeeper/core/src/declarations/Storage';
import { State } from '@tonkeeper/core/src/utils/State';
import { Address } from '@tonkeeper/core/src/formatters/Address';
import { TETHER_JETTON_MASTER } from '@tonkeeper/core';

export enum TokenApprovalStatus {
  Approved = 'approved',
  Declined = 'declined',
}

export enum TokenApprovalType {
  Collection = 'collection',
  Token = 'token',
  Inscription = 'inscription',
}

export interface ApprovalStatus {
  current: TokenApprovalStatus;
  type: TokenApprovalType;
  updated_at: number;
  approved_meta_revision: number;
}

export type TokenApprovalState = {
  tokens: Record<string, ApprovalStatus>;
  pinnedOrder: string[];
  hasWatchedCollectiblesTab: boolean;
};

export class TokenApprovalManager {
  static readonly INITIAL_STATE: TokenApprovalState = {
    tokens: {},
    pinnedOrder: [TETHER_JETTON_MASTER],
    hasWatchedCollectiblesTab: false,
  };

  public state = new State<TokenApprovalState>(TokenApprovalManager.INITIAL_STATE);

  constructor(private persistPath: string, private storage: Storage) {
    this.state.persist({
      storage: this.storage,
      key: `${this.persistPath}/tokenApproval`,
    });
    this.migrate();
  }

  removeTokenStatus(address: string) {
    const { tokens } = this.state.data;
    const rawAddress = Address.parse(address).toRaw();
    if (tokens[rawAddress]) {
      delete tokens[rawAddress];
      this.state.set({ tokens });
    }
  }

  setHasWatchedCollectiblesTab(hasWatchedCollectiblesTab: boolean) {
    this.state.set({ hasWatchedCollectiblesTab });
  }

  updateTokenStatus(
    identifier: string,
    status: TokenApprovalStatus,
    type: TokenApprovalType,
  ) {
    const { tokens } = this.state.data;
    const token = { ...tokens[identifier] };

    if (status === TokenApprovalStatus.Declined) {
      this.removePin(identifier);
    }

    if (token) {
      token.current = status;
      token.updated_at = Date.now();

      this.state.set({ tokens: { ...tokens, [identifier]: token } });
    } else {
      this.state.set({
        tokens: {
          ...tokens,
          [identifier]: {
            type,
            current: status,
            updated_at: Date.now(),
            approved_meta_revision: 0,
          },
        },
      });
    }
  }

  public async rehydrate() {
    return this.state.rehydrate();
  }

  public reset() {
    this.state.clear();
    this.state.clearPersist();
  }

  private async migrate() {
    try {
      const data = await this.storage.getItem('tokenApproval');

      if (!data) {
        return;
      }

      const state = JSON.parse(data).state;

      if (state) {
        this.storage.removeItem('tokenApproval');
        this.state.set(state);
      }
    } catch {}
  }

  public removePin(assetKey: string) {
    const { pinnedOrder } = this.state.data;
    const isPinned = pinnedOrder.includes(assetKey);

    if (!isPinned) {
      return;
    }

    this.state.set({ pinnedOrder: pinnedOrder.filter((item) => item !== assetKey) });
  }

  public togglePinAsset(assetKey: string) {
    const { pinnedOrder } = this.state.data;
    const isPinned = pinnedOrder.includes(assetKey);

    if (isPinned) {
      return this.state.set({
        pinnedOrder: pinnedOrder.filter((item) => item !== assetKey),
      });
    }
    this.state.set({ pinnedOrder: [...pinnedOrder, assetKey] });
  }

  public reorderPinnedAssets(pinnedOrder: string[]) {
    this.state.set({ pinnedOrder });
  }
}
