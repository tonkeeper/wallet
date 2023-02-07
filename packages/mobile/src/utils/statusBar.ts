import { StatusBar } from 'react-native';

import { isAndroid } from './device';
import { initialWindowMetrics } from 'react-native-safe-area-context';

export const statusBarHeight = StatusBar.currentHeight || 0;
export let safeAreaInsets: any = initialWindowMetrics?.insets ?? { top: 0, bottom: 0, left: 0, right: 0 };

export function setLightStatusBar(): void {
  if (isAndroid) {
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);
  }
  StatusBar.setBarStyle('light-content');
}

export function setDarkStatusBar(): void {
  if (isAndroid) {
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);
  }
  StatusBar.setBarStyle('dark-content');
}
