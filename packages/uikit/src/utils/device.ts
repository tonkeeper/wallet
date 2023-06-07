import { Platform, Dimensions } from 'react-native';

export const platform = Platform.OS;
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
export const isIphoneX =
  Platform.OS === 'ios' && (deviceWidth >= 812 || deviceHeight >= 812);

export const SCREEN_RATIO = (deviceWidth / deviceHeight).toFixed(2);

//  0.46 === 9 / 19.5 === iPhone X, XR, 11...
//  0.56 === 9 / 16 === iPhone 8+ and below down to iPhone 4
export const NOTCHED_DEVICE = +SCREEN_RATIO < 0.56;
