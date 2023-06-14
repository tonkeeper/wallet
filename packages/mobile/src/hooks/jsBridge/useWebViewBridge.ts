import { useCallback, useEffect, useMemo, useRef } from 'react';
import WebView, { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import {
  UseWebViewBridgeReturnType,
  WebViewBridgeMessage,
  WebViewBridgeMessageType,
} from './types';
import { getInjectableJSMessage, objectToInjection } from './utils';

export const useWebViewBridge = <
  BridgeObject extends object = {},
  Event extends object = {},
>(
  bridgeObj: BridgeObject,
  key: string,
  timeout: number | null = null,
): UseWebViewBridgeReturnType<Event> => {
  const ref = useRef<WebView>(null);
  const lastInjectedScript = useRef('');
  const injectedJavaScriptBeforeContentLoaded = useMemo(
    () => objectToInjection(bridgeObj, key, timeout),
    [bridgeObj, key, timeout],
  );

  const postMessage = useCallback((message: any) => {
    ref.current?.injectJavaScript(getInjectableJSMessage(JSON.stringify(message)));
  }, []);

  const onMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      const message = JSON.parse(event.nativeEvent.data) as WebViewBridgeMessage;

      if (message.type === WebViewBridgeMessageType.invokeRnFunc) {
        try {
          const result = await bridgeObj[message.name](...message.args);

          postMessage({
            type: WebViewBridgeMessageType.functionResponse,
            invocationId: message.invocationId,
            status: 'fulfilled',
            data: result,
          });
        } catch (e) {
          postMessage({
            type: WebViewBridgeMessageType.functionResponse,
            invocationId: message.invocationId,
            status: 'rejected',
            data: (e as any)?.message,
          });
        }
      }
    },
    [bridgeObj, postMessage],
  );

  const injectJavaScript = useCallback((script: string) => {
    ref.current?.injectJavaScript(script);

    lastInjectedScript.current = script;
  }, []);

  const onNavigationStateChange = useCallback(
    (_event: WebViewNavigation) => {
      const script = objectToInjection(bridgeObj, key, timeout);

      injectJavaScript(script);
    },
    [bridgeObj, injectJavaScript, key, timeout],
  );

  const sendEvent = useCallback(
    (event: any) => {
      postMessage({ type: WebViewBridgeMessageType.event, event });
    },
    [postMessage],
  );

  const clearLocalStorage = useCallback(() => {
    ref.current?.injectJavaScript('window.localStorage.clear();');
  }, []);

  useEffect(() => {
    const script = objectToInjection(bridgeObj, key, timeout);

    if (script !== lastInjectedScript.current) {
      injectJavaScript(script);
    }
  }, [bridgeObj, injectJavaScript, key, timeout]);

  return [
    ref,
    injectedJavaScriptBeforeContentLoaded,
    onMessage,
    onNavigationStateChange,
    sendEvent,
    clearLocalStorage,
  ];
};
