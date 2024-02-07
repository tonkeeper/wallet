import React, { memo, useCallback, useMemo, useReducer, useRef } from 'react';
import { Steezy } from '@tonkeeper/uikit';
import WebView from 'react-native-webview';
import {
  DappMainButton,
  processMainButtonMessage,
  reduceMainButton,
} from './components/DAppMainButton';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { DarkTheme } from '@tonkeeper/uikit/src/styles/themes/dark';
import {
  createInjectSource,
  dispatchMainButtonResponse,
  dispatchResponse,
} from './helpers/createInjectSource';
import { WebViewMessageEvent } from 'react-native-webview/lib/WebViewTypes';
import { getDomainFromURL } from '@tonkeeper/mobile/src/utils';
import Animated, { FadeInDown, FadeOutDown, FadeIn } from 'react-native-reanimated';
import { useNavigation } from '@tonkeeper/router';
import { useInjectEngine } from './hooks/useInjectEngine';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tk } from '@tonkeeper/mobile/src/wallet';

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
    try {
      let parsed = JSON.parse(nativeEvent.data);
      // Main button API
      const processed = processMainButtonMessage(
        parsed,
        dispatchMainButton,
        dispatchMainButtonResponse,
        webRef,
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

  const injectSource = useMemo(() => {
    const accountState = tk.wallet.cards.state.data.accounts;
    const cardsState = [];

    const initialState = {
      ...(accountState
        ? {
            account: {
              status: {
                state: {},
                kycStatus: null,
                suspended: false,
              },
            },
          }
        : {}),
      ...(cardsState ? { cardsList: [] } : {}),
    };

    const initialInjection = `
        window.initialState = ${JSON.stringify(initialState)};
        window['tonhub'] = (() => {
            const obj = {};
            Object.freeze(obj);
            return obj;
        })();
        `;

    return createInjectSource(
      {
        version: 1,
        platform: Platform.OS,
        platformVersion: Platform.Version,
        network: tk.wallet.identity.network,
        address: tk.wallet.address.ton.raw,
        publicKey: tk.wallet.identity.pubKey,
      },
      initialInjection,
      true,
    );
  }, []);

  return (
    <Animated.View
      style={{
        flexGrow: 1,
        flexBasis: 0,
        height: '100%',
        paddingTop: safeAreaInsets.top,
        paddingBottom: safeAreaInsets.bottom,
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
