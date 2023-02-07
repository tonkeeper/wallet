import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Webview from 'react-native-webview';
import { v4 as uuidv4 } from 'uuid';
import { sha512 } from 'js-sha512';

import { BuyFiatProps } from '$core/BuyFiat/BuyFiat.interface';
import { Icon, Loader, NavBar } from '$uikit';
import * as S from './BuyFiat.style';
import { mainSelector } from '$store/main';
import { walletAddressSelector } from '$store/wallet';
import { useExchangeMethodInfo, useTheme } from '$hooks';
import { goBack } from '$navigation';
import { getServerConfig } from '$shared/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deviceWidth, isAndroid, trackEvent } from '$utils';
import { useDeeplinking } from '$libs/deeplinking';

export const BuyFiat: FC<BuyFiatProps> = ({ route }) => {
  const currency = route.params.currency;
  const methodId = route.params.methodId;
  const dispatch = useDispatch();
  const gotPurchaseId = useRef(false);
  const webviewRef = useRef<Webview>(null);
  const [isBackShown, setBackShown] = useState(false);
  const { top: topInset } = useSafeAreaInsets();
  const theme = useTheme();
  const [isLoading, setLoading] = useState(true);

  const method = useExchangeMethodInfo(methodId);
  const { fiatCurrency } = useSelector(mainSelector);
  const address = useSelector(walletAddressSelector);
  const [webViewKey, setWebViewKey] = useState(1);

  const deeplinking = useDeeplinking();

  const handleHttpError = useCallback(() => {
    setWebViewKey(webViewKey + 1);
  }, [setWebViewKey, webViewKey]);

  const handleError = useCallback((e) => {
    console.log(e.nativeEvent);
  }, []);

  const webviewUrl = useMemo(() => {
    const addr = address[currency];

    let result = method.action_button.url.replace(/\{ADDRESS\}/g, addr);

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
      result += `&signature=${sha512(`${addr}${getServerConfig('mercuryoSecret')}`)}`;
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

  const webviewStyle: any = {};
  if (isLoading && !isAndroid) {
    webviewStyle.heihgt = 0;
  } else {
    webviewStyle.flex = 1;
  }

  return (
    <>
      {renderHeader()}
      {isLoading && (
        <S.LoaderWrap>
          <Loader size="medium" />
        </S.LoaderWrap>
      )}
      <S.Wrap
        style={{
          width: deviceWidth,
          backgroundColor: theme.colors.backgroundPrimary,
          ...webviewStyle,
        }}
      >
        <S.Browser
          ref={webviewRef}
          key={webViewKey}
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
          forceDarkOn
          allowsInlineMediaPlayback
          allowsFullscreenVideo
          keyboardDisplayRequiresUserAction={false}
          mediaPlaybackRequiresUserAction={false}
        />
      </S.Wrap>
    </>
  );
};
