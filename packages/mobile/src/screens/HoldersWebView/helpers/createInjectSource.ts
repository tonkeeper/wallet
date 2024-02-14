import WebView from 'react-native-webview';
import { EdgeInsets } from 'react-native-safe-area-context';
import { tonConnectDeviceInfo } from '$tonconnect';

export const mainButtonAPI = `
window['main-button'] = (() => {
    let requestId = 0;
    let callbacks = {};
    let __MAIN_BUTTON_AVAILIBLE = true;

    const setText = (text) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ data: { name: 'main-button.setText', args: { text } } }));
    };

    const onClick = (callback) => {
        let id = requestId++;
        callback.uniqueId = id;
        window.ReactNativeWebView.postMessage(JSON.stringify({ id, data: { name: 'main-button.onClick' } }));
        callbacks[id] = callback;
    };

    const offClick = (callback) => {
        let id = callback.uniqueId;
        if (!id) {
            id = requestId;
        }
        window.ReactNativeWebView.postMessage(JSON.stringify({ id, data: { name: 'main-button.offClick' } }));
        delete callbacks[id];
    };

    const showProgress = (leaveActive) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ data: { name: 'main-button.showProgress', args: { leaveActive } } }));
    };

    const hideProgress = () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ data: { name: 'main-button.hideProgress' } }));
    };

    const show = () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ data: { name: 'main-button.show' } }));
    };

    const hide = () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ data: { name: 'main-button.hide' } }));
    };

    const enable = () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ data: { name: 'main-button.enable' } }));
    };

    const disable = () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ data: { name: 'main-button.disable' } }));
    };

    const setParams = (params) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ data: { name: 'main-button.setParams', args: params } }));
    };

    const __response = (ev) => {
        if (ev && callbacks[ev.id] && ev.data) {
            let c = callbacks[ev.id];
            c(ev.data);
            return;
        }

        const lastId = Object.keys(callbacks).pop();
        if (lastId && callbacks[lastId]) {
            let c = callbacks[lastId];
            c();
        }
    }

    const obj = { setText, onClick, offClick, showProgress, hideProgress, show, hide, enable, disable, setParams, __MAIN_BUTTON_AVAILIBLE, __response };
    Object.freeze(obj);
    return obj;
})();
`;

export const toasterAPI = `
window['toaster'] = (() => {
    let __TOASTER_AVAILIBLE = true;

    const show = (props) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ data: { name: 'toaster.show', args: props } }));
    };

    const clear = () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ data: { name: 'toaster.clear' } }));
    };

    const push = (props) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ data: { name: 'toaster.push', args: props } }));
    };

    const pop = () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ data: { name: 'toaster.pop' } }));
    };

    const obj = { show, clear, push, pop, __TOASTER_AVAILIBLE };
    Object.freeze(obj);
    return obj;
})();
`;

export const statusBarAPI = (safeArea: EdgeInsets) => {
  return `
    window['status-bar'] = (() => {
        let __STATUS_BAR_AVAILIBLE = true;
        const safeArea = ${JSON.stringify(safeArea)};

        const setStatusBarStyle = (style) => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ data: { name: 'status-bar.setStatusBarStyle', args: [style] } }));
        };

        const setStatusBarBackgroundColor = (backgroundColor) => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ data: { name: 'status-bar.setStatusBarBackgroundColor', args: [backgroundColor] } }));
        };

        const statusBar = { setStatusBarStyle, setStatusBarBackgroundColor };

        Object.freeze(statusBar);
        Object.freeze(safeArea);

        const obj = { __STATUS_BAR_AVAILIBLE, statusBar, safeArea };

        Object.freeze(obj);
        return obj;
    })();
    `;
};

type InjectionConfig = {
  version: number;
  platform: 'ios' | 'android' | 'windows' | 'macos' | 'web';
  platformVersion: string | number;
  network: string;
  address: string;
  publicKey: string;
  walletConfig: string;
  walletType: string;
  signature: string;
  time: number;
  subkey: {
    domain: string;
    publicKey: string;
    time: number;
    signature: string;
  };
};

type InjectSourceProps = {
  config: InjectionConfig;
  safeArea: EdgeInsets;
  additionalInjections?: string;
  useMainButtonAPI?: boolean;
  useStatusBarAPI?: boolean;
};

export function createInjectSource(sourceProps: InjectSourceProps) {
  return `
    ${sourceProps.additionalInjections || ''}
    ${sourceProps.useMainButtonAPI ? mainButtonAPI : ''}
    ${sourceProps.useStatusBarAPI ? statusBarAPI(sourceProps.safeArea) : ''}
    window['ton-x'] = (() => {
        let requestId = 0;
        let callbacks = {};
        let config = ${JSON.stringify(sourceProps.config)};
        let __IS_TON_X = true;
    
        const call = (name, args, callback) => {
            let id = requestId++;
            window.ReactNativeWebView.postMessage(JSON.stringify({ id, data: { name, args } }));
            callbacks[id] = callback;
        };

        const __response = (ev) => {
            if (ev && typeof ev.id === 'number' && ev.data && callbacks[ev.id]) {
                let c = callbacks[ev.id];
                delete callbacks[ev.id];
                c(ev.data);
            }
        }

        Object.freeze(config);
        
        const obj = { call, config, __IS_TON_X, __response };
        Object.freeze(obj);
        return obj;
    })();
    true;
    `;
}

export function dispatchMainButtonResponse(webRef: React.RefObject<WebView>) {
  let injectedMessage = "window['main-button'].__response(); true;";
  webRef.current?.injectJavaScript(injectedMessage);
}

export function dispatchResponse(webRef: React.RefObject<WebView>, data: any) {
  let injectedMessage = `window['ton-x'].__response(${JSON.stringify(data)}); true;`;
  webRef.current?.injectJavaScript(injectedMessage);
}
