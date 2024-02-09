import AsyncStorage from '@react-native-async-storage/async-storage';

import { getWalletName } from '$shared/dynamicConfig';
import { LogItem } from '$store/main/interface';

export class MainDB {
  static async timeSyncedDismissedTimestamp(): Promise<false | number> {
    const timeSyncedDismissed = await AsyncStorage.getItem('timeSyncedDismissed');
    return (
      !!timeSyncedDismissed &&
      timeSyncedDismissed !== 'false' &&
      parseFloat(timeSyncedDismissed)
    );
  }

  static async setTimeSyncedDismissed(isDismissed: false | number) {
    if (isDismissed) {
      await AsyncStorage.setItem('timeSyncedDismissed', isDismissed.toString());
    } else {
      await AsyncStorage.setItem('timeSyncedDismissed', 'false');
    }
  }

  static async isNewSecurityFlow(): Promise<boolean> {
    return (await AsyncStorage.getItem('new_security_flow')) === 'yes';
  }

  static async isBiometryEnabled(): Promise<boolean> {
    return (await AsyncStorage.getItem('biometry_enabled')) === 'yes';
  }

  static async getKeychainService() {
    return await AsyncStorage.getItem('keychainService');
  }

  static async setKeychainService(keychainService: string) {
    await AsyncStorage.setItem('keychainService', keychainService);
  }
}

export async function getHiddenNotifications(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(
    `${getWalletName()}_hidden_internal_notifications`,
  );

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
    `${getWalletName()}_hidden_internal_notifications`,
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
