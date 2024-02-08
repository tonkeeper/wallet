import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { Steezy } from '@tonkeeper/uikit';
import WebView from 'react-native-webview';
import {
  DappMainButton,
  processMainButtonMessage,
  reduceMainButton,
} from './components/DAppMainButton';
import { BackHandler, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { DarkTheme } from '@tonkeeper/uikit/src/styles/themes/dark';
import {
  createInjectSource,
  dispatchMainButtonResponse,
  dispatchResponse,
} from './helpers/createInjectSource';
import {
  WebViewMessageEvent,
  WebViewNavigation,
} from 'react-native-webview/lib/WebViewTypes';
import { getDomainFromURL } from '@tonkeeper/mobile/src/utils';
import Animated, { FadeInDown, FadeOutDown, FadeIn } from 'react-native-reanimated';
import { useNavigation } from '@tonkeeper/router';
import { useInjectEngine } from './hooks/useInjectEngine';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { processStatusBarMessage } from './helpers/processStatusBarMessage';
import { extractWebViewQueryAPIParams } from './utils/extractWebViewQueryAPIParams';

export const HoldersWebView = memo(() => {
  const navigation = useNavigation();
  const webRef = useRef<WebView>(null);
  const safeAreaInsets = useSafeAreaInsets();
  const [mainButton, dispatchMainButton] = useReducer(reduceMainButton(), {
    text: '',
    textColor: DarkTheme.buttonPrimaryForeground,
    color: DarkTheme.buttonPrimaryBackground,
    disabledColor: DarkTheme.buttonPrimaryBackgroundDisabled,
    isVisible: false,
    isActive: false,
    isProgressVisible: false,
    onPress: undefined,
  });

  const [holdersParams, setHoldersParams] = useState({
    backPolicy: 'back',
    showKeyboardAccessoryView: false,
    lockScroll: true,
  });

  const injectionEngine = useInjectEngine(
    getDomainFromURL('https://tonkeeper-dev.holders.io'),
    'Title',
    true,
  );

  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    const nativeEvent = event.nativeEvent;

    // Resolve parameters
    let data: any;
    console.log(nativeEvent.data);
    let id: number;
    let processed = false;
    try {
      let parsed = JSON.parse(nativeEvent.data);
      // Main button API
      let processed = processMainButtonMessage(
        parsed,
        dispatchMainButton,
        dispatchMainButtonResponse,
        webRef,
      );

      if (processed) {
        return;
      }

      processed = processStatusBarMessage(
        parsed,
        StatusBar.setBarStyle,
        StatusBar.setBackgroundColor,
      );

      if (processed) {
        return;
      }

      if (typeof parsed.id !== 'number') {
        console.warn('Invalid operation id');
        return;
      }
      id = parsed.id;
      data = parsed.data;
    } catch (e) {
      console.warn(e);
      return;
    }

    if (data.name === 'closeApp') {
      navigation.goBack();
      return;
    }

    // Execute
    (async () => {
      let res = { type: 'error', message: 'Unknown error' };
      try {
        res = await injectionEngine.execute(data);
      } catch (e) {
        console.warn(e);
      }
      dispatchResponse(webRef, { id, data: res });
    })();
  }, []);

  const handleError = useCallback((err: any) => {
    console.log(err);
  }, []);

  const onCloseApp = useCallback(() => {
    navigation.goBack();
  }, []);

  const onNavigation = useCallback(
    (url: string) => {
      const params = extractWebViewQueryAPIParams(url);
      if (params.closeApp) {
        onCloseApp();
        return;
      }
      setHoldersParams((prev) => {
        const newValue = {
          ...prev,
          ...Object.fromEntries(
            Object.entries(params).filter(([, value]) => value !== undefined),
          ),
        };
        return newValue;
      });
    },
    [setHoldersParams],
  );

  const onHardwareBackPress = useCallback(() => {
    if (holdersParams.backPolicy === 'lock') {
      return true;
    }
    if (holdersParams.backPolicy === 'back') {
      if (webRef.current) {
        webRef.current.goBack();
      }
      return true;
    }
    if (holdersParams.backPolicy === 'close') {
      navigation.goBack();
      return true;
    }
    return false;
  }, [holdersParams.backPolicy]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onHardwareBackPress);
    };
  }, [onHardwareBackPress]);

  const injectSource = useMemo(() => {
    const initialState = {};

    const initialInjection = `
        window.initialState = ${JSON.stringify(initialState)};
        window['tonkeeper'] = (() => {
            const obj = {};
            Object.freeze(obj);
            return obj;
        })();
        `;

    return createInjectSource({
      config: {
        version: 1,
        platform: Platform.OS,
        platformVersion: Platform.Version,
        network: tk.wallet.identity.network,
        address: tk.wallet.address.ton.raw,
        publicKey: tk.wallet.identity.pubKey,
      },
      safeArea: safeAreaInsets,
      additionalInjections: initialInjection,
      useMainButtonAPI: true,
      useStatusBarAPI: true,
    });
  }, []);

  return (
    <Animated.View
      style={{
        flexGrow: 1,
        flexBasis: 0,
        height: '100%',
      }}
      entering={FadeIn}
    >
      <WebView
        webviewDebuggingEnabled
        ref={webRef}
        javaScriptEnabled
        domStorageEnabled
        source={{
          uri: 'https://tonkeeper-dev.holders.io',
        }}
        onMessage={handleWebViewMessage}
        onNavigationStateChange={(event: WebViewNavigation) => {
          // Searching for supported query
          onNavigation(event.url);
        }}
        onError={handleError}
        onHttpError={handleError}
        injectedJavaScriptBeforeContentLoaded={injectSource}
        originWhitelist={['*']}
        decelerationRate="normal"
        javaScriptCanOpenWindowsAutomatically
        mixedContentMode="always"
        hideKeyboardAccessoryView
        thirdPartyCookiesEnabled
        allowFileAccess
        forceDarkOn
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        keyboardDisplayRequiresUserAction={false}
        mediaPlaybackRequiresUserAction={false}
        style={styles.webView.static}
      />
      {mainButton && mainButton.isVisible && (
        <KeyboardAvoidingView
          style={{
            position: 'absolute',
            bottom: safeAreaInsets.bottom,
            left: 0,
            right: 0,
          }}
          behavior={Platform.OS === 'ios' ? 'position' : undefined}
          contentContainerStyle={{
            marginHorizontal: 16,
            marginBottom: 16,
          }}
        >
          <Animated.View
            style={Platform.select({
              android: { marginHorizontal: 16, marginBottom: 16 },
            })}
            entering={FadeInDown}
            exiting={FadeOutDown.duration(100)}
          >
            <DappMainButton {...mainButton} />
          </Animated.View>
        </KeyboardAvoidingView>
      )}
    </Animated.View>
  );
});

const styles = Steezy.create({
  webView: {
    flex: 1,
  },
});
