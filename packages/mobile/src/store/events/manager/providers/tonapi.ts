import { Cache, NextFromPair } from '$store/events/manager/cache';
import { BaseProvider } from '$store/events/manager/providers/base';
import { getServerConfig } from '$shared/constants';
import { EventModel } from '$store/models';
import { AccountsApi, Configuration, GetEventsByAccountRequest } from '@tonkeeper/core/src/legacy';
import { i18n } from '$translation';

export class TonapiProvider extends BaseProvider {
  public readonly name = 'TonapiProvider';
  private limit = 25;
  private api: AccountsApi;

  constructor(address: string) {
    super(address);
    this.api = new AccountsApi(
      new Configuration({
        basePath: getServerConfig('tonapiIOEndpoint'),
        headers: {
          Authorization: `Bearer ${getServerConfig('tonApiV2Key')}`,
          'Accept-Language': i18n.locale,
        },
      }),
    );
  }

  async loadNext(cache: Cache): Promise<EventModel[]> {
    if (!this.canMore) {
      return [];
    }

    const params: GetEventsByAccountRequest = {
      accountId: this.address,
      limit: this.limit,
    };
    if (this.nextFrom) {
      params.beforeLt = parseInt(this.nextFrom);
    }
    const resp = await this.api.getEventsByAccount(params);
    let events: EventModel[] = [];
    if (resp.events) {
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
