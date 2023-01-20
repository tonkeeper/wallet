import { RouteProp } from '@react-navigation/native';
import { AppStackRouteNames } from '$navigation';
import { AppStackParamList } from '$navigation/AppStack';

export enum ScanQRMode {
  /** 
  * calls cb immediatly. Perfect for testing on emulators
  */
  DEBUG_IMMEDIATELY = 1,
}

export interface ScanQROptions {
  mode?: ScanQRMode;
  /** 
  * ignore real scan result and use this value
  */
  debug_url?: string;
}

export interface ScanQRProps {
  route: RouteProp<AppStackParamList, AppStackRouteNames.ScanQR>;
}
