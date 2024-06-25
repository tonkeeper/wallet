import { config } from '$config';
import {
  ActivitySection,
  ActionItem,
  ActivityModel,
  ActionType,
} from '../models/ActivityModel';
import { ActivityLoader } from './ActivityLoader';
import { State, Storage, Logger, Address } from '@tonkeeper/core';

type Cursors = {
  tron: number | null;
  ton: number | null;
};

export type ActivityListState = {
  sections: ActivitySection[];
  error?: string | null;
  isReloading: boolean;
  isLoading: boolean;
  hasMore: boolean;
  isNotCoinReceived: boolean;
  notCoinActionId: string | null;
};

export class ActivityList {
  private refetchTimer: NodeJS.Timeout | null = null;
  private readonly refetchTime = 15000;

  private cursors: Cursors = { ton: null, tron: null };
  private groups = {};

  public state = new State<ActivityListState>({
    isReloading: false,
    isLoading: false,
    hasMore: true,
    sections: [],
    error: null,
    isNotCoinReceived: false,
    notCoinActionId: null,
  });

  constructor(
    private persistPath: string,
    private activityLoader: ActivityLoader,
    private storage: Storage,
  ) {
    this.state.persist({
      storage: this.storage,
      key: `${this.persistPath}/ActivityList`,
      partialize: ({ sections, isNotCoinReceived }) => ({
        sections: sections.map((section) => ({
          ...section,
          data: section.data.slice(0, 100),
        })),
        isNotCoinReceived,
      }),
      rehydrated: ({ sections }) => {
        sections.forEach((section) => {
          this.activityLoader.setLoadedActions(section.data);
        });
      },
    });
  }

  public setNotCoinReceived() {
    this.state.set({ isNotCoinReceived: true });
  }

  public async load(cursors?: Cursors) {
    try {
      this.state.set({ isLoading: true, error: null });

      const ton = await this.activityLoader.loadTonActions({ cursor: cursors?.ton });
      // const tronEvents = await this.fetchTronEvents({ cursor: cursors?.tron });

      if (!cursors) {
        this.groups = {};
      }

      const updatedGroups = ton.actions.reduce((groups, action, index) => {
        if (index === 0 && action.event.in_progress) {
          this.createTaskForReload();
        }

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

      this.cursors = {
        tron: null,
        ton: ton.cursor ?? null,
      };

      this.state.set({
        sections: Object.values(this.groups),
        hasMore: Boolean(ton.cursor),
        isLoading: false,
      });

      if (!this.state.data.isNotCoinReceived) {
        const notcoinAction = ton.actions.find((action) => {
          return (
            action.type === ActionType.JettonTransfer &&
            action.payload.recipient &&
            Address.compare(
              action.payload.recipient.address,
              this.activityLoader.tonRawAddress,
            ) &&
            Address.compare(
              action.payload.jetton.address,
              config.get('notcoin_jetton_master'),
            )
          );
        });

        this.state.set({ notCoinActionId: notcoinAction?.action_id });
      }
    } catch (err) {
      const message = `[ActivityList]: ${Logger.getErrorMessage(err)}`;
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
      return this.load(this.cursors);
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

  private createTaskForReload() {
    this.clearReloadTask();
    this.refetchTimer = setTimeout(() => {
      this.reload();
      this.refetchTimer = null;
    }, this.refetchTime);
  }

  private clearReloadTask() {
    if (this.refetchTimer !== null) {
      clearTimeout(this.refetchTimer);
    }
  }

  private sortByTimestamp(items: ActionItem[]) {
    return items.sort((a, b) => b.event.timestamp - a.event.timestamp);
  }
}
