import { ActivityModel, ActivitySection } from '../models/ActivityModel';
import { Logger, State, Storage } from '@tonkeeper/core';
import { ActivityLoader } from './ActivityLoader';

import { AccountEvent, ActionTypeEnum } from '@tonkeeper/core/src/TonAPI';

type TonActivityListState = {
  sections: ActivitySection[];
  error?: string | null;
  isReloading: boolean;
  isLoading: boolean;
  hasMore: boolean;
};

export class TonActivityList {
  private cursor: number | null = null;
  private groups = {};

  public state = new State<TonActivityListState>({
    isReloading: false,
    isLoading: false,
    hasMore: true,
    sections: [],
    error: null,
  });

  constructor(
    private persistPath: string,
    private activityLoader: ActivityLoader,
    private storage: Storage,
  ) {
    this.state.persist({
      partialize: ({ sections }) => ({ sections }),
      storage: this.storage,
      key: `${this.persistPath}/TonActivityList`,
    });
  }

  public async load(cursor?: number | null) {
    try {
      this.state.set({ isLoading: true, error: null });

      const ton = await this.activityLoader.loadTonActions({
        cursor: cursor,
        filter: this.filterEvents([
          ActionTypeEnum.TonTransfer,
          ActionTypeEnum.SmartContractExec,
          ActionTypeEnum.ContractDeploy,
          ActionTypeEnum.JettonSwap,
          ActionTypeEnum.NftPurchase,
          ActionTypeEnum.DepositStake,
          ActionTypeEnum.WithdrawStake,
          ActionTypeEnum.WithdrawStakeRequest,
          ActionTypeEnum.ElectionsRecoverStake,
          ActionTypeEnum.ElectionsDepositStake,
        ]),
      });

      if (!cursor) {
        this.groups = {};
      }

      const updatedGroups = ton.actions.reduce((groups, action, index) => {
        const groupKey = ActivityModel.getGroupKey(action.event.timestamp);
        if (!groups[groupKey]) {
          groups[groupKey] = {
            isFirst: index === 0,
            timestamp: action.event.timestamp * 1000,
            data: [],
          };
        }

        groups[groupKey].data.push(action);

        return groups;
      }, this.groups);

      this.groups = updatedGroups;

      this.cursor = ton.cursor ?? null;
      this.state.set({
        sections: Object.values(this.groups),
        hasMore: Boolean(ton.cursor),
        isLoading: false,
      });
    } catch (err) {
      const message = `[TonActivityList]: ${Logger.getErrorMessage(err)}`;
      console.log(message);
      this.state.set({
        isLoading: false,
        error: message,
      });
    }
  }

  public async loadMore() {
    const { isLoading, hasMore, error } = this.state.data;
    if (!isLoading && hasMore && error === null) {
      return this.load(this.cursor);
    }
  }

  public async rehydrate() {
    return this.state.rehydrate();
  }

  public clear() {
    this.groups = {};
  }

  public async reload() {
    this.state.set({ isReloading: true });
    await this.load();
    this.state.set({ isReloading: false });
  }

  public prefetch() {
    this.load();
  }

  private filterEvents = (types: ActionTypeEnum[]) => (events: AccountEvent[]) => {
    return events.reduce<AccountEvent[]>((acc, event) => {
      const pass = event.actions.every((action) => {
        for (let type of types) {
          if (action.type === type) {
            return true;
          }
        }

        return false;
      });

      if (pass) {
        acc.push(event);
      }

      return acc;
    }, []);
  };
}
