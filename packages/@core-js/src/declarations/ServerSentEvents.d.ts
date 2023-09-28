export type EventSourceData = Record<string, any>;

export type EventSourceCallback = (event: EventSourceData) => void;

export type EventSourceListener = {
  open(): void;
  close(): void;
  addEventListener(type: string, listener: EventSourceCallback): void;
  removeEventListener(type: string, listener: EventSourceCallback): void;
  removeAllEventListeners(type?: string): void;
  dispatch(type: string, data: EventSourceData): void;
};

export type ServerSentEventsOptions = {
  baseUrl: () => string;
  token: () => string;
};

export declare class ServerSentEvents {
  constructor(options: ServerSentEventsOptions);
  listen(url: string, params?: Record<string, any>): EventSourceListener;
}

