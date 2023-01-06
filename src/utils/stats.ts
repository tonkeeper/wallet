import { getServerConfig } from '$shared/constants';
import { init, logEvent } from '@amplitude/analytics-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

let TrakingEnabled = false;
export function initStats() {
  init(getServerConfig('amplitudeKey'), '-', {
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
    }
  });
  TrakingEnabled = true; 
}

export function trackEvent(name: string, params: any = {}) {
  if (!TrakingEnabled) {
    return;
  }
  logEvent(name, params);
}


export async function trackFirstLaunch() {
  const isFirstLaunch = !(await AsyncStorage.getItem('launched_before'));
  if (isFirstLaunch) {
    trackEvent('first_launch');
    await AsyncStorage.setItem('launched_before', 'true');
  }
}