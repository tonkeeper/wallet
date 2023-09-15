import { ServerSentEvents, ServerSentEventsOptions } from '@tonkeeper/core';
import EventSource from 'react-native-sse';

export class EventStream implements ServerSentEvents {
  private baseUrl: () => string;
  private token: () => string;

  constructor(options: ServerSentEventsOptions) {
    this.baseUrl = options.baseUrl;
    this.token = options.token;
  }

  public listen(url: string) {
    const baseUrl = this.baseUrl();
    const token = this.token();
  
    return new EventSource(baseUrl + '/' + url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}