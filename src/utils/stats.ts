import appsFlyer from 'react-native-appsflyer';
import { debugLog } from '$utils';
import { getServerConfig } from '$shared/constants';

let TrakingEnabled = false;
export function initStats() {
  appsFlyer.anonymizeUser(true);

  const options = {  
    devKey: getServerConfig('appsflyerDevKey'),
    appId: getServerConfig('appsflyerAppId'),
    onInstallConversionData: true,
    isDebug: false,
  };

  appsFlyer.initSdk(
    options,
    (result) => {
      console.log('AppsFlyer', result);
    },
    (error) => {
      debugLog('AppsFlyer', error);
    },
  );

  TrakingEnabled = true; 
}

export function trackEvent(name: string, params: any = {}) {
  if (!TrakingEnabled) {
    return;
  }
  appsFlyer.logEvent(name, params);
}
