import { ServerSentEvents, ServerSentEventsOptions } from '@tonkeeper/core';
import { jsonToUrl } from '@tonkeeper/core';
import EventSource from 'react-native-sse';

export class AppServerSentEvents implements ServerSentEvents {
  private baseUrl: () => string;
  private token: () => string;

  constructor(options: ServerSentEventsOptions) {
    this.baseUrl = options.baseUrl;
    this.token = options.token;
  }

  public listen(url: string, params: Record<string, any> = {}) {
    const baseUrl = this.baseUrl();
    const token = this.token();

    const queryParams = jsonToUrl(Object.assign(params, { token }));

    return new EventSource(`${baseUrl}${url}?${queryParams}`);
  }
}
