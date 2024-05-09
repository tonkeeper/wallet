import { config } from '$config';
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
  } catch (e) {}
}

export async function trackFirstLaunch() {
  const isFirstLaunch = !(await AsyncStorage.getItem('launched_before'));
  if (isFirstLaunch) {
    trackEvent('first_launch');
    await AsyncStorage.setItem('launched_before', 'true');
  }
}
