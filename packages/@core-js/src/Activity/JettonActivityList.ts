import { ActivityModel, ActivitySections } from '../models/ActivityModel';
import { ActivityLoader } from './ActivityLoader';
import { State } from '../utils/State';

type JettonActivityListState = {
  sections: ActivitySections;
  isReloading: boolean;
  isLoading: boolean;
  hasMore: boolean;
};

export class JettonActivityList {
  private cursor: number | null = null;
  private groups = {};

  public state = new State<JettonActivityListState>({
    isReloading: false,
    isLoading: false,
    hasMore: true,
    sections: [],
  });

  constructor(private activityLoader: ActivityLoader) {}

  public async load(jettonId: string, cursor?: number | null) {
    try {
      this.state.set({ isLoading: true });
      const jettonEvents = await this.activityLoader.loadJettonActions({ jettonId, cursor });
      if (!cursor) {
        this.groups = {};
      }

      const updatedGroups = jettonEvents.actions.reduce((groups, action, index) => {
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

      (this.cursor = jettonEvents.cursor ?? null),
        this.state.set({
          sections: Object.values(this.groups),
          hasMore: Boolean(jettonEvents.cursor),
          isLoading: false,
        });
    } catch (err) {
      this.state.set({
        isLoading: false,
      });
    }
  }

  public async loadMore(jettonId: string) {
    if (!this.state.data.isLoading) {
      return this.load(jettonId, this.cursor);
    }
  }

  public preload() {}

  public clear() {
    this.groups = {};
  }

  public async reload(jettonId: string) {
    this.state.set({ isReloading: true });
    await this.load(jettonId);
    this.state.set({ isReloading: false });
  }
}
