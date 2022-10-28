import { Cache } from '$store/events/manager/cache';
import { BaseProviderInterface } from '$store/events/manager/providers/base';
import { TonapiProvider } from '$store/events/manager/providers/tonapi';
import { ActionType, EventModel } from '$store/models';
import { reloadSubscriptionsFromServer } from '$store/subscriptions/sagas';

export interface EventsManagerOptions {
  walletName: string;
  address: string;
}

export class EventsManager {
  private cache: Cache;
  private provider: BaseProviderInterface;
  private loadSingleProvider: string | null = null;
  private address: string;

  private events: { [index: string]: EventModel } = {};

  constructor(options: EventsManagerOptions) {
    this.address = options.address;
    this.cache = new Cache(options.walletName);
    this.provider = new TonapiProvider(options.address);
  }

  async fetch(ignoreCache?: boolean): Promise<EventModel[]> {
    // @ts-ignore
    try {
      reloadSubscriptionsFromServer(this.address);
    } catch (e) {}

    let events: any = await this.provider.loadNext(this.cache);

    for (let event of events) {
      this.events[event.eventId] = event;
    }

    return await this.build(ignoreCache);
  }

  private getMempoolKey(event: EventModel): string {
    let rawAction = event.actions[0];
    let action = rawAction[ActionType[rawAction.type]];
    return `${action?.amount}_${action?.recipient?.address}`; // _${action?.nft?.address}_${action?.jetton?.address}_${action?.subscription}
  }

  async build(ignoreCache?: boolean): Promise<EventModel[]> {
    this.loadSingleProvider = null;

    const cached = ignoreCache ? [] : await this.cache.get();
    const cacheMap: { [index: string]: EventModel } = {};
    for (let event of cached) {
      if (event.inProgress) {
        continue;
      }
      cacheMap[event.eventId] = event;
    }

    const allEvents: EventModel[] = Object.values({ ...cacheMap, ...this.events });

    allEvents.sort((a: EventModel, b: EventModel) =>
      a.timestamp > b.timestamp ? -1 : 1,
    );

    const result: EventModel[] = [];

    for (let event of allEvents) {
      result.push(event);
    }

    this.cache.save(allEvents).catch(() => {
      console.log("Can't save events to cache");
    });
    return result;
  }

  async canLoadMore(): Promise<boolean> {
    if (this.provider.canLoadMore()) {
      return true;
    }

    return false;
  }
}
