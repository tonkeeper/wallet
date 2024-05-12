import AsyncStorage from '@react-native-async-storage/async-storage';

import { LogItem } from '$store/main/interface';

export async function getHiddenNotifications(): Promise<string[]> {
  const raw = await AsyncStorage.getItem('mainnet_default_hidden_internal_notifications');

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export async function hideNotification(id: string) {
  const hidden = await getHiddenNotifications();
  hidden.push(id);

  await AsyncStorage.setItem(
    'mainnet_default_hidden_internal_notifications',
    JSON.stringify(hidden.slice(-20)),
  );
}

export async function getSavedLogs(): Promise<LogItem[]> {
  const raw = await AsyncStorage.getItem('logs');
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export async function setSavedLogs(logs: LogItem[]) {
  await AsyncStorage.setItem('logs', JSON.stringify(logs));
}

export async function getSwapShownCount() {
  const stored = Number(await AsyncStorage.getItem('swap_shown_count')) || 0;
  return stored;
}

export async function setSwapShownCount(count: number) {
  await AsyncStorage.setItem('swap_shown_count', `${count}`);
}
