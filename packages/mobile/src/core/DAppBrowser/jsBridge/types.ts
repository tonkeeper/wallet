import { RefObject } from 'react';
import WebView, { WebViewMessageEvent } from 'react-native-webview';

export enum WebViewBridgeMessageType {
  invokeRnFunc = 'invokeRnFunc',
  functionResponse = 'functionResponse',
  event = 'event',
}

export interface WebViewBridgeMessage {
  type: string;
  invocationId: string;
  name: string;
  args: any[];
}

export type UseWebViewBridgeReturnType<Event> = [
  RefObject<WebView<{}>>,
  string,
  (e: WebViewMessageEvent) => void,
  (event: Event) => void,
];
