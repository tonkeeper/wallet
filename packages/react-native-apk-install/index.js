import { NativeModules } from 'react-native';

const { ApkInstall } = NativeModules;

export function installApk(path) {
  return ApkInstall.installApk(path);
}
