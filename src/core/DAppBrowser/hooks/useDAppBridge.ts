import { AppRequest, ConnectEvent, RpcMethod, WalletEvent } from '@tonconnect/protocol';
import { useCallback, useMemo, useState } from 'react';
import { CURRENT_PROTOCOL_VERSION, TonConnect, tonConnectDeviceInfo } from '$tonconnect';
import { useWebViewBridge } from '../jsBridge';
import { TonConnectInjectedBridge } from './models';
import { getDomainFromURL } from '$utils';
import { getConnectedAppByDomain, useConnectedAppsStore } from '$store';

export const useDAppBridge = (walletAddress: string, webViewUrl: string) => {
  const domain = getDomainFromURL(webViewUrl);

  const [connectEvent, setConnectEvent] = useState<ConnectEvent | null>(null);

  const isConnected = useConnectedAppsStore(
    useCallback(
      (state) => {
        const app = getConnectedAppByDomain(walletAddress, domain, state);

        if (!app) {
          return false;
        }

        return Boolean(connectEvent && connectEvent.event === 'connect');
      },
      [connectEvent, domain, walletAddress],
    ),
  );

  const bridgeObject = useMemo((): TonConnectInjectedBridge => {
    return {
      deviceInfo: tonConnectDeviceInfo,
      protocolVersion: CURRENT_PROTOCOL_VERSION,
      isWalletBrowser: true,
      connect: async (protocolVersion, request) => {
        const event = await TonConnect.connect(
          protocolVersion,
          request,
          undefined,
          undefined,
          webViewUrl,
        );

        setConnectEvent(event);

        return event;
      },
      restoreConnection: async () => {
        const event = await TonConnect.autoConnect(webViewUrl);

        setConnectEvent(event);

        return event;
      },
      disconnect: () => {
        setConnectEvent(null);

        return TonConnect.disconnect(webViewUrl);
      },
      send: async <T extends RpcMethod>(request: AppRequest<T>) =>
        TonConnect.handleRequestFromInjectedBridge(request, webViewUrl),
    };
  }, [webViewUrl]);

  const [ref, injectedJavaScriptBeforeContentLoaded, onMessage, sendEvent] =
    useWebViewBridge<TonConnectInjectedBridge, WalletEvent>(bridgeObject);

  const disconnect = useCallback(async () => {
    try {
      await TonConnect.disconnect(webViewUrl);
      sendEvent({ event: 'disconnect', payload: {} });
    } catch {}
  }, [webViewUrl, sendEvent]);

  return {
    ref,
    injectedJavaScriptBeforeContentLoaded,
    onMessage,
    isConnected,
    disconnect,
  };
};
