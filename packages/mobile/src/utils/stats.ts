import { config } from '$config';
import { init, logEvent } from '@amplitude/analytics-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Aptabase from '@aptabase/react-native';
import DeviceInfo from 'react-native-device-info';
import { firebase } from '@react-native-firebase/analytics';

firebase
  .analytics()
  .setUserId(DeviceInfo.getUniqueId())
  .catch(() => null);

let TrakingEnabled = false;
export function initStats() {
  const appKey = config.get('aptabaseAppKey');
  if (appKey) {
    Aptabase.init(appKey, {
      host: config.get('aptabaseEndpoint'),
      appVersion: DeviceInfo.getVersion(),
    });
  }
  init(config.get('amplitudeKey'), '-', {
    minIdLength: 1,
    deviceId: '-',
    trackingOptions: {
      ipAddress: false,
      deviceModel: true,
      language: false,
      osName: true,
      osVersion: true,
      platform: true,
      adid: false,
      carrier: false,
    },
  });
  TrakingEnabled = true;
}

export async function trackEvent(name: string, params: any = {}) {
  try {
    const appKey = config.get('aptabaseAppKey');
    if (!TrakingEnabled) {
      return;
    }
    if (appKey) {
      Aptabase.trackEvent(
        name,
        Object.assign(params, { firebase_user_id: DeviceInfo.getUniqueId() }),
      );
    }
    logEvent(name, params);
  } catch (e) {}
}

export async function trackFirstLaunch() {
  const isFirstLaunch = !(await AsyncStorage.getItem('launched_before'));
  if (isFirstLaunch) {
    trackEvent('first_launch');
    await AsyncStorage.setItem('launched_before', 'true');
  }
}
