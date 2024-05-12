import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { StonfiInjectedObject } from './types';
import { openSignRawModal } from '$core/ModalContainer/NFTOperations/Modals/SignRawModal';
import { getTimeSec } from '$utils/getTimeSec';
import { useNavigation } from '@tonkeeper/router';
import { getCorrectUrl, getDomainFromURL, isAndroid } from '$utils';
import { logEvent } from '@amplitude/analytics-browser';
import { useWebViewBridge } from '$hooks/jsBridge';
import { useWallet } from '@tonkeeper/shared/hooks';
import { config } from '$config';
import { tk } from '$wallet';
import { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import { Linking, StatusBar } from 'react-native';
import { useDeeplinking } from '$libs/deeplinking';
import DeviceInfo from 'react-native-device-info';
import { BatterySupportedTransaction } from '$wallet/managers/BatteryManager';
import { Icon, Modal, Steezy, TouchableOpacity, View } from '@tonkeeper/uikit';
import { Opacity } from '$shared/constants';
import WebView from 'react-native-webview';

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

          if (valid_until < getTimeSec()) {
            reject();

            return;
          }

          openSignRawModal(
            request,
            {
              experimentalWithBattery:
                tk.wallet.battery.state.data.supportedTransactions[
                  BatterySupportedTransaction.Swap
                ],
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

  const webViewStyle = Steezy.useStyle(styles.webView);

  return (
    <Modal>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <WebView
          style={webViewStyle}
          ref={ref}
          injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
          onMessage={onMessage}
          javaScriptEnabled
          domStorageEnabled
          source={webViewSource}
          onLoadEnd={handleLoadEnd}
          startInLoadingState={true}
          originWhitelist={[`https://${getDomainFromURL(baseUrl)}`, 'ton://*']}
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
          <View style={styles.overlay}>
            <TouchableOpacity activeOpacity={Opacity.ForSmall} onPress={nav.goBack}>
              <View style={styles.backButton}>
                <Icon name="ic-close-16" color="buttonSecondaryForeground" />
              </View>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </Modal>
  );
};

const styles = Steezy.create(({ colors, safeArea }) => ({
  container: {
    flex: 1,
    paddingTop: isAndroid ? safeArea.top : 0,
    backgroundColor: colors.backgroundPage,
  },
  webView: {
    flex: 1,
    backgroundColor: colors.backgroundPage,
  },
  overlay: {
    position: 'absolute',
    top: isAndroid ? safeArea.top : 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 19.5,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
    backgroundColor: colors.backgroundPage,
  },
  backButton: {
    backgroundColor: colors.buttonSecondaryBackground,
    height: 32,
    width: 32,
    borderRadius: 32 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
