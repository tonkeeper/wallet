import { ActivityModel, ActivitySection } from '../models/ActivityModel';

import { ActivityLoader } from './ActivityLoader';

import { Logger, State, Storage } from '@tonkeeper/core';

type JettonActivityListState = {
  sections: { [key in string]: ActivitySection[] };
  error?: string | null;
  isReloading: boolean;
  isLoading: boolean;
  hasMore: boolean;
};

export class JettonActivityList {
  private cursor: number | null = null;
  private groups = {};

  public state = new State<JettonActivityListState>({
    sections: {},
    isReloading: false,
    isLoading: false,
    hasMore: true,
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
      key: `${this.persistPath}/JettonActivityList`,
    });
  }

  public async load(jettonId: string, cursor?: number | null) {
    try {
      this.state.set({ isLoading: true, error: null });
      const jettonEvents = await this.activityLoader.loadJettonActions({
        jettonId,
        cursor,
      });
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

      this.cursor = jettonEvents.cursor ?? null;

      this.state.set(({ sections }) => ({
        sections: Object.assign(sections, {
          [jettonId]: Object.values(this.groups),
        }),
        hasMore: Boolean(jettonEvents.cursor),
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      const message = `[JettonActivityList]: ${Logger.getErrorMessage(err)}`;
      console.log(message);
      this.state.set({
        isLoading: false,
        error: message,
      });
    }
  }

  public async loadMore(jettonId: string) {
    const { isLoading, hasMore, error } = this.state.data;
    if (!isLoading && hasMore && error === null) {
      return this.load(jettonId, this.cursor);
    }
  }

  public async rehydrate() {
    return this.state.rehydrate();
  }

  public clear() {
    this.groups = {};
    this.cursor = null;
    this.state.set({
      isReloading: false,
      isLoading: false,
      hasMore: true,
      error: null,
    });
  }

  public async reload(jettonId: string) {
    this.state.set({ isReloading: true });
    await this.load(jettonId);
    this.state.set({ isReloading: false });
  }
}
