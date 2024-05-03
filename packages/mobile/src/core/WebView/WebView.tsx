import React, { FC, useCallback, useRef, useState } from 'react';
import WebviewComponent from 'react-native-webview';

import { Loader, NavBar } from '$uikit';
import * as S from './WebView.style';
import { useTheme } from '$hooks/useTheme';
import { deviceWidth, isAndroid } from '$utils';
import { WebViewProps } from './WebView.interface';
import { useDeeplinking } from '$libs/deeplinking';
import { config } from '$config';

export const WebView: FC<WebViewProps> = ({ route }) => {
  const webviewRef = useRef<WebviewComponent>(null);
  const [isBackShown] = useState(false);
  const theme = useTheme();
  const [isLoading, setLoading] = useState(true);
  const deeplinking = useDeeplinking();
  const [webViewKey, setWebViewKey] = useState(1);

  const handleHttpError = useCallback(() => {
    setWebViewKey(webViewKey + 1);
  }, [setWebViewKey, webViewKey]);

  const handleError = useCallback((e) => {
    console.log(e.nativeEvent);
  }, []);

  const handleBack = useCallback(() => {
    webviewRef.current?.goBack();
  }, [webviewRef]);

  function renderHeader() {
    return (
      <NavBar isClosedButton hideBackButton={!isBackShown} onBackPress={handleBack} />
    );
  }

  const handleLoad = useCallback(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const handleOpenExternalLink = useCallback((req) => {
    const isHTTPS =
      !req.url.startsWith('https://app.tonkeeper.com') &&
      req.url.search('https://') !== -1;

    if (isHTTPS) {
      return true;
    } else {
      console.log(req.url);
      deeplinking.resolve(req.url, {
        params: { withGoBack: false },
      });

      return false;
    }
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
            uri: route.params.webViewUrl,
          }}
          onShouldStartLoadWithRequest={handleOpenExternalLink}
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
          allowFileAccess
          forceDarkOn={theme.isDark}
          allowsInlineMediaPlayback
          allowsFullscreenVideo
          keyboardDisplayRequiresUserAction={false}
          mediaPlaybackRequiresUserAction={false}
          webviewDebuggingEnabled={config.get('devmode_enabled')}
        />
      </S.Wrap>
    </>
  );
};
