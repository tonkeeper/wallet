"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.installApk = installApk;
var _reactNative = require("react-native");
const LINKING_ERROR = `The package 'react-native-apk-install' doesn't seem to be linked. Make sure: \n\n` + _reactNative.Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const ApkInstall = _reactNative.NativeModules.ApkInstall ? _reactNative.NativeModules.ApkInstall : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
function installApk(path) {
  if (_reactNative.Platform.OS === 'ios') {
    return Promise.reject(new Error('Not supported on iOS'));
  }
  return ApkInstall.installApk(path);
}
//# sourceMappingURL=index.js.map