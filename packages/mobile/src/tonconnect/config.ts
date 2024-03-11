import { DeviceInfo } from '@tonconnect/protocol';
import RNDeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

export const CURRENT_PROTOCOL_VERSION = 2;

export const MIN_PROTOCOL_VERSION = 2;

const getPlatform = (): DeviceInfo['platform'] => {
  if (Platform.OS === 'ios') {
    return RNDeviceInfo.isTablet() ? 'ipad' : 'iphone';
  }

  return Platform.OS as DeviceInfo['platform'];
};

export const tonConnectDeviceInfo: DeviceInfo = {
  platform: getPlatform(),
  appName: RNDeviceInfo.getApplicationName(),
  appVersion: RNDeviceInfo.getVersion(),
  maxProtocolVersion: CURRENT_PROTOCOL_VERSION,
  features: ['SendTransaction', { name: 'SendTransaction', maxMessages: 4 }],
};
