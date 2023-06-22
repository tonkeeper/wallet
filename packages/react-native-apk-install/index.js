import { NativeModules } from 'react-native';

const { ApkInstall } = NativeModules;

export function installApk(path) {
  if (Platform.OS === 'ios') {
    return Promise.reject(new Error('Not supported on iOS'));
  }
  return ApkInstall.installApk(path);
}
