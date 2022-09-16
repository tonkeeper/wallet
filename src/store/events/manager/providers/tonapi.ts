import { Cache, NextFromPair } from '$store/events/manager/cache';
import { BaseProvider } from '$store/events/manager/providers/base';
import { getServerConfig } from '$shared/constants';
import { EventModel } from '$store/models';
import { EventApi, Configuration } from 'tonapi-sdk-js';

export class TonapiProvider extends BaseProvider {
  public readonly name = 'TonapiProvider';
  private limit = 25;
  private api: EventApi;

  constructor(address: string) {
    super(address);
    this.api = new EventApi(
      new Configuration({
        basePath: getServerConfig('tonapiIOEndpoint'),
        headers: {
          Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
        },
      }),
    );
  }

  async loadNext(cache: Cache): Promise<EventModel[]> {
    if (!this.canMore) {
      return [];
    }

    const params: any = {
      account: this.address,
      limit: this.limit,
    };
    if (this.nextFrom) {
      params.beforeLt = this.nextFrom;
    }
    const resp: any = await this.api.accountEvents(params);

    let events: EventModel[] = [];
    if (resp?.events) {
      events = resp.events.map(this.map);
      await this.applyNextFrom(events, cache);
    }

    return events;
  }

  map(event: any): EventModel {
    return event;
  }

  makeNextFrom(event: EventModel | NextFromPair): string {
    if ('nextFrom' in event) {
      return event.nextFrom;
    } else {
      return `${event.lt}`;
    }
  }
}
