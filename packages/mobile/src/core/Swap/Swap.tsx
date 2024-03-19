import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { StonfiInjectedObject } from './types';
import { openSignRawModal } from '$core/ModalContainer/NFTOperations/Modals/SignRawModal';
import { getTimeSec } from '$utils/getTimeSec';
import { useNavigation } from '@tonkeeper/router';
import * as S from './Swap.style';
import { Icon } from '$uikit';
import { getCorrectUrl, getDomainFromURL } from '$utils';
import { logEvent } from '@amplitude/analytics-browser';
import { checkIsTimeSynced } from '$navigation/hooks/useDeeplinkingResolvers';
import { useWebViewBridge } from '$hooks/jsBridge';
import { useWallet } from '@tonkeeper/shared/hooks';
import { config } from '$config';
import { tk } from '$wallet';
import { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import { Linking } from 'react-native';
import { useDeeplinking } from '$libs/deeplinking';
import DeviceInfo from 'react-native-device-info';

interface Props {
  jettonAddress?: string;
  ft?: string;
  tt?: string;
}

const addVersionToUrl = (url: string) => {
  const startChar = url.includes('?') ? '&' : '?';

  return `${url}${startChar}clientVersion=${DeviceInfo.getVersion()}`;
};

export const Swap: FC<Props> = (props) => {
  const { jettonAddress } = props;
  const deeplinking = useDeeplinking();

  const baseUrl = config.get('stonfiUrl', tk.wallet.isTestnet);
  const url = useMemo(() => {
    const ft = props.ft ?? jettonAddress ?? 'TON';
    const tt = props.tt ?? (jettonAddress ? 'TON' : null);

    let path = `${baseUrl}?ft=${ft}`;

    if (tt) {
      path += `&tt=${tt}`;
    }

    return path;
  }, [baseUrl, jettonAddress, props.ft, props.tt]);

  const [webViewSource, setWebViewSource] = useState({ uri: addVersionToUrl(url) });

  const openUrl = useCallback(
    (url: string) => setWebViewSource({ uri: addVersionToUrl(getCorrectUrl(url)) }),
    [],
  );

  const wallet = useWallet();

  const address = wallet?.address.ton.friendly;

  const nav = useNavigation();

  const bridgeObject = useMemo(
    (): StonfiInjectedObject => ({
      address,
      close: () => nav.goBack(),
      sendTransaction: (request) =>
        new Promise((resolve, reject) => {
          const { valid_until } = request;

          if (!checkIsTimeSynced()) {
            reject();

            return;
          }

          if (valid_until < getTimeSec()) {
            reject();

            return;
          }

          openSignRawModal(
            request,
            {
              expires_sec: valid_until,
              response_options: {
                broadcast: false,
              },
            },
            resolve,
            reject,
            false,
            false,
          );
        }),
    }),
    [address, nav],
  );

  const [ref, injectedJavaScriptBeforeContentLoaded, onMessage] =
    useWebViewBridge<StonfiInjectedObject>(bridgeObject, 'tonkeeperStonfi');

  const [overlayVisible, setOverlayVisible] = useState(true);

  const handleLoadEnd = useCallback(() => {
    setTimeout(() => setOverlayVisible(false), 300);
  }, []);

  useEffect(() => {
    logEvent('swap_open', { token: jettonAddress ?? 'TON' });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenExternalLink = useCallback(
    (req: ShouldStartLoadRequest): boolean => {
      const resolver = deeplinking.getResolver(req.url, {
        params: {
          openUrl,
          redirectToActivity: false,
        },
      });

      if (resolver) {
        setTimeout(() => {
          resolver();
        }, 200);
        return false;
      }

      if (req.url.startsWith('http')) {
        return true;
      }

      setTimeout(() => {
        Linking.openURL(req.url);
      }, 200);

      return false;
    },
    [deeplinking, openUrl],
  );

  return (
    <S.Container>
      <S.Browser
        ref={ref}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        source={webViewSource}
        onLoadEnd={handleLoadEnd}
        startInLoadingState={true}
        originWhitelist={[`https://${getDomainFromURL(baseUrl)}`, 'ton://']}
        decelerationRate="normal"
        javaScriptCanOpenWindowsAutomatically
        mixedContentMode="always"
        hideKeyboardAccessoryView
        thirdPartyCookiesEnabled={true}
        keyboardDisplayRequiresUserAction={false}
        mediaPlaybackRequiresUserAction={false}
        onShouldStartLoadWithRequest={handleOpenExternalLink}
        webviewDebuggingEnabled={config.get('devmode_enabled')}
      />
      {overlayVisible ? (
        <S.Overlay>
          <S.BackButtonContainer onPress={nav.goBack}>
            <S.BackButton>
              <Icon name="ic-close-16" color="foregroundPrimary" />
            </S.BackButton>
          </S.BackButtonContainer>
        </S.Overlay>
      ) : null}
    </S.Container>
  );
};
