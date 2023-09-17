import { ActivitySection, ActionItem, ActivityModel } from '../models/ActivityModel';
import { ActivityLoader } from './ActivityLoader';
import { State } from '../utils/State';

type Cursors = {
  tron: number | null;
  ton: number | null;
};

type ActivityListState = {
  sections: ActivitySection[];
  isReloading: boolean;
  isLoading: boolean;
  hasMore: boolean;
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
  });

  constructor(private activityLoader: ActivityLoader) {}

  public async load(cursors?: Cursors) {
    try {
      this.state.set({ isLoading: true });

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
    } catch (err) {
      console.log(err);
      this.state.set({
        isLoading: false,
        hasMore: false,
      });
    }
  }

  public async loadMore() {
    if (!this.state.data.isLoading && this.state.data.hasMore) {
      return this.load(this.cursors);
    }
  }

  public preload() {}

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

  public prefetch() {
    this.load();
  }
}
