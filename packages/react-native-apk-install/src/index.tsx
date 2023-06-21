import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-apk-install' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const ApkInstall = NativeModules.ApkInstall
  ? NativeModules.ApkInstall
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function installApk(path: string): Promise<number> {
  if (Platform.OS === 'ios') {
    return Promise.reject(new Error('Not supported on iOS'));
  }
  return ApkInstall.installApk(path);
}
