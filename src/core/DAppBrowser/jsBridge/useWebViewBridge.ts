import { useCallback, useMemo, useRef } from 'react';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import {
  UseWebViewBridgeReturnType,
  WebViewBridgeMessage,
  WebViewBridgeMessageType,
} from './types';
import { objectToInjection } from './utils';

export const useWebViewBridge = <
  BridgeObject extends object = {},
  Event extends object = {},
>(
  bridgeObj: BridgeObject,
  timeout: number | null = null,
): UseWebViewBridgeReturnType<Event> => {
  const ref = useRef<WebView>(null);
  const injectedJavaScriptBeforeContentLoaded = useMemo(
    () => objectToInjection(bridgeObj, timeout),
    [bridgeObj, timeout],
  );

  const onMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      const message = JSON.parse(event.nativeEvent.data) as WebViewBridgeMessage;

      if (message.type === WebViewBridgeMessageType.invokeRnFunc) {
        try {
          const result = await bridgeObj[message.name](...message.args);

          ref.current?.postMessage(
            JSON.stringify({
              type: WebViewBridgeMessageType.functionResponse,
              invocationId: message.invocationId,
              status: 'fulfilled',
              data: result,
            }),
          );
        } catch (e) {
          ref.current?.postMessage(
            JSON.stringify({
              type: WebViewBridgeMessageType.functionResponse,
              invocationId: message.invocationId,
              status: 'rejected',
              data: (e as any)?.message,
            }),
          );
        }
      }
    },
    [bridgeObj],
  );

  const sendEvent = useCallback((event: any) => {
    ref.current?.postMessage(
      JSON.stringify({ type: WebViewBridgeMessageType.event, event }),
    );
  }, []);

  return [ref, injectedJavaScriptBeforeContentLoaded, onMessage, sendEvent];
};
