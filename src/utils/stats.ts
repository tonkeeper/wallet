import { getServerConfig } from '$shared/constants';
import { init, logEvent } from '@amplitude/analytics-browser';

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
