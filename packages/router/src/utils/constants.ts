import { Platform, StatusBar } from 'react-native';

export const isAndroid = Platform.OS === 'android';
export const StatusBarHeight = StatusBar.currentHeight ?? 0;
