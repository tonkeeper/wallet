import { useDeeplinking } from '$libs/deeplinking';
import { openDAppsSearch } from '$navigation';
import { walletSelector } from '$store/wallet';
import { getCorrectUrl, getSearchQuery, getUrlWithoutTonProxy } from '$utils';
import React, { FC, memo, useCallback, useState } from 'react';
import { Linking, useWindowDimensions } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import {
  ShouldStartLoadRequest,
  WebViewNavigation,
  WebViewProgressEvent,
} from 'react-native-webview/lib/WebViewTypes';
import { useSelector } from 'react-redux';
import { BrowserNavBar } from './components/BrowserNavBar/BrowserNavBar';
import * as S from './DAppBrowser.style';
import { useAppInfo } from './hooks/useAppInfo';
import { useDAppBridge } from './hooks/useDAppBridge';

export interface DAppBrowserProps {
  url: string;
}

const TONKEEPER_UTM = 'utm_source=tonkeeper';

const addUtmToUrl = (url: string) => {
  const startChar = url.includes('?') ? '&' : '?';

  return `${url}${startChar}${TONKEEPER_UTM}`;
};

const removeUtmFromUrl = (url: string) => {
  return url.replace(new RegExp(`[?|&]${TONKEEPER_UTM}`), '');
};

const DAppBrowserComponent: FC<DAppBrowserProps> = (props) => {
  const { url: initialUrl } = props;

  const { address } = useSelector(walletSelector);
  const walletAddress = address?.ton || '';

  const deeplinking = useDeeplinking();

  const [currentUrl, setCurrentUrl] = useState(getCorrectUrl(initialUrl));

  const [webViewSource, setWebViewSource] = useState({ uri: addUtmToUrl(currentUrl) });

  const app = useAppInfo(walletAddress, currentUrl);

  const [title, setTitle] = useState('');

  const [canGoBack, setCanGoBack] = useState(false);

  const { ref, isConnected, disconnect, ...webViewProps } = useDAppBridge(
    walletAddress,
    currentUrl,
  );

  const dimensions = useWindowDimensions();

  const progress = useSharedValue(0);

  const loadingBarAnimatedStyle = useAnimatedStyle(() => ({
    width: dimensions.width * progress.value,
    opacity: progress.value === 1 ? 0 : 1,
  }));

  const handleLoadProgress = useCallback(
    (e: WebViewProgressEvent) => {
      const nextProgress = e.nativeEvent.progress;

      if (progress.value > nextProgress) {
        progress.value = 0;
      }

      progress.value = withTiming(e.nativeEvent.progress);

      setTitle(e.nativeEvent.title);
      setCurrentUrl(getUrlWithoutTonProxy(removeUtmFromUrl(e.nativeEvent.url)));
    },
    [progress],
  );

  const handleNavigationStateChange = useCallback((e: WebViewNavigation) => {
    setCanGoBack(e.canGoBack);
  }, []);

  const openUrl = useCallback(
    (url: string) => setWebViewSource({ uri: addUtmToUrl(getCorrectUrl(url)) }),
    [],
  );

  const handleOpenExternalLink = useCallback(
    (req: ShouldStartLoadRequest): boolean => {
      const resolver = deeplinking.getResolver(req.url, {
        params: {
          openUrl,
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

  const handleGoBackPress = useCallback(() => {
    ref.current?.goBack();
  }, [ref]);

  const handleRefreshPress = useCallback(() => {
    ref.current?.reload();
  }, [ref]);

  const handleTitlePress = useCallback(() => {
    const initialQuery =
      getSearchQuery(currentUrl) || currentUrl || getCorrectUrl(initialUrl);

    openDAppsSearch(initialQuery, openUrl);
  }, [currentUrl, initialUrl, openUrl]);

  return (
    <S.Container>
      <BrowserNavBar
        title={app?.name || title}
        url={currentUrl}
        isConnected={isConnected}
        walletAddress={walletAddress}
        canGoBack={canGoBack}
        onBackPress={handleGoBackPress}
        onTitlePress={handleTitlePress}
        onRefreshPress={handleRefreshPress}
        disconnect={disconnect}
      />
      <S.DAppContainer>
        <S.DAppWebView
          ref={ref}
          key={webViewSource.uri}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          javaScriptCanOpenWindowsAutomatically
          mixedContentMode="always"
          decelerationRate="normal"
          hideKeyboardAccessoryView
          thirdPartyCookiesEnabled={true}
          forceDarkOn={false}
          allowsInlineMediaPlayback
          allowsFullscreenVideo
          source={webViewSource}
          onLoadProgress={handleLoadProgress}
          pullToRefreshEnabled={true}
          allowsBackForwardNavigationGestures={true}
          onNavigationStateChange={handleNavigationStateChange}
          onShouldStartLoadWithRequest={handleOpenExternalLink}
          {...webViewProps}
        />
        <S.LoadingBar style={loadingBarAnimatedStyle} />
      </S.DAppContainer>
    </S.Container>
  );
};

export const DAppBrowser = memo(DAppBrowserComponent);
