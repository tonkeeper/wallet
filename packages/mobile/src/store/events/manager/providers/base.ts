import { EventModel } from '$store/models';
import { Cache, NextFromPair } from '$store/events/manager/cache';

export interface BaseProviderInterface {
  loadNext(cache: Cache): Promise<EventModel[]>;
  canLoadMore(): boolean;
  name: string;
}

export abstract class BaseProvider implements BaseProviderInterface {
  abstract name: string;
  readonly address: string;
  nextFrom: string | null = null;
  canMore = true;

  constructor(address: string) {
    this.address = address;
  }

  loadNext(_: Cache): Promise<EventModel[]> {
    throw new Error('loadNext is not implemented');
  }

  async calcLastEvent(
    events: EventModel[],
    cache: Cache,
  ): Promise<EventModel | null | NextFromPair> {
    const cached = await cache.get();

    let nextFrom = '';
    let event: EventModel | null | NextFromPair = null;

    const nextFromList = await cache.getNextFromList(this.name);
    if (events.length > 0) {
      if (cached.length > 0 && cached[0].lt > events[events.length - 1].lt) {
        event = events[events.length - 1];
        nextFrom = this.makeNextFrom(event);
      } else if (
        nextFromList.length > 0 &&
        nextFromList[0].lt >= events[events.length - 1].lt
      ) {
        nextFrom = nextFromList[0].nextFrom;
        event = nextFromList[0];
      } else {
        event = events[events.length - 1];
        nextFrom = this.makeNextFrom(event);
      }
    } else {
      if (nextFromList.length > 0) {
        nextFrom = nextFromList[0].nextFrom;
        event = nextFromList[0];
      } else if (cached.length > 0) {
        event = cached[cached.length - 1];
        nextFrom = this.makeNextFrom(event);
      }
    }

    if (nextFrom === this.nextFrom) {
      return null;
    }

    return event;
  }

  makeNextFrom(_: EventModel | NextFromPair): string {
    throw new Error('makeNextFrom is not implemented');
  }

  filterEvent(_: EventModel): boolean {
    throw new Error('filterEvent is not implemented');
  }

  async storeNextFrom(cache: Cache, lt: number, nextFrom: string) {
    const nextFromList = await cache.getNextFromList(this.name);

    let filtered = [];
    for (let item of nextFromList) {
      if (item.lt < lt) {
        filtered.push(item);
      }
    }

    nextFromList.unshift({
      lt,
      nextFrom,
    });
    await cache.saveNextFromList(this.name, nextFromList);
  }

  async clearNextFromList(cache: Cache) {
    await cache.saveNextFromList(this.name, []);
  }

  canLoadMore() {
    return !!this.nextFrom && this.canMore;
  }

  async applyNextFrom(events: EventModel[], cache: Cache) {
    const lastEvent = await this.calcLastEvent(events, cache);
    if (lastEvent) {
      this.nextFrom = this.makeNextFrom(lastEvent);
      await this.storeNextFrom(cache, lastEvent.lt, this.nextFrom);
      this.canMore = true;
    } else {
      this.nextFrom = null;
      this.canMore = false;
      await this.clearNextFromList(cache);
    }
  }
}
