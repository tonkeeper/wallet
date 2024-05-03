import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import Webview from 'react-native-webview';
import { v4 as uuidv4 } from 'uuid';
import { sha512 } from 'js-sha512';

import { BuyFiatProps } from '$core/BuyFiat/BuyFiat.interface';
import { Icon, Loader, NavBar } from '$uikit';
import * as S from './BuyFiat.style';
import { useExchangeMethodInfo } from '$hooks/useExchangeMethodInfo';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDeeplinking } from '$libs/deeplinking';
import { debugLog } from '$utils/debugLog';
import { goBack } from '$navigation/imperative';
import { trackEvent } from '$utils/stats';
import { useWallet, useWalletCurrency } from '@tonkeeper/shared/hooks';
import { config } from '$config';
import { tk } from '$wallet';
import { useTheme } from '@tonkeeper/uikit';

export const BuyFiat: FC<BuyFiatProps> = ({ route }) => {
  const currency = route.params.currency;
  const methodId = route.params.methodId;
  const gotPurchaseId = useRef(false);
  const webviewRef = useRef<Webview>(null);
  const [isBackShown, setBackShown] = useState(false);
  const { top: topInset } = useSafeAreaInsets();
  const [isLoading, setLoading] = useState(true);

  const method = useExchangeMethodInfo(methodId);
  const fiatCurrency = useWalletCurrency();
  const wallet = useWallet();

  const deeplinking = useDeeplinking();

  const handleHttpError = useCallback((event) => {
    debugLog('[BuyFiat:handleHttpError]', event.nativeEvent.url);
  }, []);

  const handleError = useCallback((event) => {
    debugLog('[BuyFiat:handleError]', event.nativeEvent.url);
  }, []);

  const webviewUrl = useMemo(() => {
    let result = method.action_button.url.replace(
      /\{ADDRESS\}/g,
      wallet.address.ton.friendly,
    );

    if (method.id === 'mercuryo_sell') {
      result = result
        .replace(/\{CUR\_FROM\}/g, currency.toUpperCase())
        .replace(/\{CUR\_TO\}/g, fiatCurrency.toUpperCase());
    } else {
      result = result
        .replace(/\{CUR\_FROM\}/g, fiatCurrency.toUpperCase())
        .replace(/\{CUR\_TO\}/g, currency.toUpperCase());
    }

    if (['mercuryo', 'mercuryo_sell'].includes(method.id)) {
      const txId = 'mercuryo_' + uuidv4();
      result = result.replace(/\{TX_ID\}/g, txId);
      result = result.replace(/\=TON\&/gi, '=TONCOIN&');
      result += `&signature=${sha512(
        `${wallet.address.ton.friendly}${config.get(
          'mercuryoSecret',
          tk.wallet.isTestnet,
        )}`,
      )}`;
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNavigationChange = useCallback(
    (e) => {
      if (!e.url) {
        return;
      }

      if (e.url.match(/#endsession/)) {
        goBack();
        return;
      }

      if (method.successUrlPattern) {
        const regexp = new RegExp(method.successUrlPattern.pattern, 'i');
        const matches = e.url.match(regexp);
        if (matches) {
          const purchaseId = matches[method.successUrlPattern.purchaseIdIndex];
          if (gotPurchaseId.current === purchaseId) {
            return;
          }

          gotPurchaseId.current = purchaseId;
          goBack();

          trackEvent('buy_crypto');
        }
      }

      const resolver = deeplinking.getResolver(e.url, {
        delay: 200,
        params: { methodId: method.id },
      });

      if (resolver) {
        resolver();
      }
    },
    [deeplinking, method.id, method.successUrlPattern],
  );

  const handleBack = useCallback(() => {
    webviewRef.current?.goBack();
  }, [webviewRef]);

  const handleClose = useCallback(() => {
    goBack();
  }, []);

  function renderHeader() {
    if (method.id === 'neocrypto') {
      return (
        <S.CloseButtonWrap style={{ top: topInset }} onPress={handleClose}>
          <S.CloseButton>
            <Icon name="ic-close-16" color="foregroundPrimary" />
          </S.CloseButton>
        </S.CloseButtonWrap>
      );
    } else {
      return (
        <NavBar isClosedButton hideBackButton={!isBackShown} onBackPress={handleBack} />
      );
    }
  }

  const handleLoad = useCallback(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const theme = useTheme();

  return (
    <S.Wrap>
      {renderHeader()}
      <S.Browser
        ref={webviewRef}
        javaScriptEnabled
        domStorageEnabled
        source={{
          uri: webviewUrl,
        }}
        onLoad={handleLoad}
        onHttpError={handleHttpError}
        onError={handleError}
        startInLoadingState={true}
        originWhitelist={['*']}
        decelerationRate="normal"
        javaScriptCanOpenWindowsAutomatically
        mixedContentMode="always"
        hideKeyboardAccessoryView
        thirdPartyCookiesEnabled={true}
        onNavigationStateChange={handleNavigationChange}
        allowFileAccess
        forceDarkOn={theme.isDark && methodId !== 'onramp'}
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        keyboardDisplayRequiresUserAction={false}
        mediaPlaybackRequiresUserAction={false}
        webviewDebuggingEnabled={config.get('devmode_enabled')}
      />
      {isLoading && (
        <S.LoaderWrap>
          <Loader size="medium" />
        </S.LoaderWrap>
      )}
    </S.Wrap>
  );
};
