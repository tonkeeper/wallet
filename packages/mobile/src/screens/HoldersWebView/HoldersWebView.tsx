import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { Steezy, useTheme } from '@tonkeeper/uikit';
import WebView from 'react-native-webview';
import {
  DappMainButton,
  processMainButtonMessage,
  reduceMainButton,
} from './components/DAppMainButton';
import { BackHandler, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import {
  createInjectSource,
  dispatchMainButtonResponse,
  dispatchResponse,
} from './helpers/createInjectSource';
import {
  WebViewMessageEvent,
  WebViewNavigation,
} from 'react-native-webview/lib/WebViewTypes';
import { getDomainFromURL } from '$utils';
import Animated, { FadeInDown, FadeOutDown, FadeIn } from 'react-native-reanimated';
import { useNavigation } from '@tonkeeper/router';
import { useInjectEngine } from './hooks/useInjectEngine';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tk } from '$wallet';
import { processStatusBarMessage } from './helpers/processStatusBarMessage';
import { extractWebViewQueryAPIParams } from './utils/extractWebViewQueryAPIParams';
import { useDAppBridge } from '$core/DAppBrowser/hooks/useDAppBridge';
import { i18n } from '@tonkeeper/shared/i18n';
import { config } from '$config';
import { useWalletCurrency } from '@tonkeeper/shared/hooks';
import { Address } from '@tonkeeper/core';
import { RouteProp } from '@react-navigation/native';
import { MainStackRouteNames } from '$navigation';
import { MainStackParamList } from '$navigation/MainStack';

export interface HoldersWebViewProps {
  path?: string;
  route: RouteProp<MainStackParamList, MainStackRouteNames.HoldersWebView>;
}

export const HoldersWebView = memo<HoldersWebViewProps>((props) => {
  const navigation = useNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const [mainButton, dispatchMainButton] = useReducer(reduceMainButton(), {
    text: '',
    textColor: theme.buttonPrimaryForeground,
    color: theme.buttonPrimaryBackground,
    disabledColor: theme.buttonPrimaryBackgroundDisabled,
    isVisible: false,
    isActive: false,
    isProgressVisible: false,
    onPress: undefined,
  });
  const currency = useWalletCurrency();
  const endpoint = config.get('holdersAppEndpoint', tk.wallet.isTestnet);

  const queryParams = new URLSearchParams({
    lang: i18n.locale,
    currency: currency,
    theme: 'holders',
    'theme-style': 'dark',
  });

  const url = `${endpoint}${props.route.params?.path ?? ''}?${queryParams.toString()}`;

  const [holdersParams, setHoldersParams] = useState({
    backPolicy: 'back',
    showKeyboardAccessoryView: false,
    lockScroll: false,
  });

  const injectionEngine = useInjectEngine(getDomainFromURL(url), 'Title', true);

  const { injectedJavaScriptBeforeContentLoaded, ref, onMessage } = useDAppBridge(
    Address.parse(tk.wallet.address.ton.raw).toString({
      testOnly: tk.wallet.isTestnet,
      bounceable: true,
    }),
    config.get('holdersAppEndpoint', false),
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

      if (!parsed.data) {
        onMessage(event);
        return;
      }

      let processed = processMainButtonMessage(
        parsed,
        dispatchMainButton,
        dispatchMainButtonResponse,
        ref,
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
      dispatchResponse(ref, { id, data: res });
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
    [onCloseApp],
  );

  const onHardwareBackPress = useCallback(() => {
    if (holdersParams.backPolicy === 'lock') {
      return true;
    }
    if (holdersParams.backPolicy === 'back') {
      if (ref.current) {
        ref.current.goBack();
      }
      return true;
    }
    if (holdersParams.backPolicy === 'close') {
      navigation.goBack();
      return true;
    }
    return false;
  }, [holdersParams.backPolicy, navigation, ref]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onHardwareBackPress);
    };
  }, [onHardwareBackPress]);

  const injectSource = useMemo(() => {
    return createInjectSource({
      config: {
        version: 1,
        platform: Platform.OS,
        platformVersion: Platform.Version,
        network: tk.wallet.isTestnet ? 'testnet' : 'mainnet',
        address: Address.parse(tk.wallet.address.ton.raw).toString({
          bounceable: true,
          testOnly: tk.wallet.isTestnet,
        }),
        publicKey: Buffer.from(tk.wallet.pubkey, 'hex').toString('base64'),
      },
      safeArea: safeAreaInsets,
      additionalInjections: injectedJavaScriptBeforeContentLoaded,
      useMainButtonAPI: true,
      useStatusBarAPI: true,
    });
  }, [injectedJavaScriptBeforeContentLoaded, safeAreaInsets]);
  return (
    <Animated.View style={styles.container.static} entering={FadeIn}>
      <WebView
        ref={ref}
        startInLoadingState
        source={{
          uri: url,
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
        allowFileAccessFromFileURLs={false}
        allowUniversalAccessFromFileURLs={false}
        scrollEnabled={!holdersParams.lockScroll}
        autoManageStatusBarEnabled={false}
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        keyboardDisplayRequiresUserAction={false}
        hideKeyboardAccessoryView={!holdersParams.showKeyboardAccessoryView}
        bounces={false}
        mediaPlaybackRequiresUserAction={false}
        contentInset={{ top: 0, bottom: 0 }}
        style={styles.webView.static}
        webviewDebuggingEnabled={config.get('devmode_enabled')}
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
  container: {
    flexGrow: 1,
    flexBasis: 0,
    height: '100%',
    backgroundColor: 'black',
  },
  webView: {
    flex: 1,
  },
});
