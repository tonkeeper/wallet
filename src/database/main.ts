import AsyncStorage from '@react-native-async-storage/async-storage';

import { FiatCurrency, ServerConfig, ServerConfigVersion } from '$shared/constants';
import { getWalletName } from '$shared/dynamicConfig';
import { LogItem } from '$store/main/interface';
import { AccentKey, AccentNFTIcon } from '$styled';

export class MainDB {
  static async isJettonsEnabled(): Promise<boolean> {
    return (await AsyncStorage.getItem('jettons')) !== 'false';
  }

  static async setJettonsEnabled(isEnabled: boolean) {
    if (isEnabled) {
      await AsyncStorage.setItem('jettons', 'true');
    } else {
      await AsyncStorage.setItem('jettons', 'false');
    }
  }

  static async setShowV4R1(show: boolean) {
    if (show) {
      await AsyncStorage.setItem('show_v4r1', 'true');
    } else {
      await AsyncStorage.setItem('show_v4r1', 'false');
    }
  }

  static async getShowV4R1() {
    let show = await AsyncStorage.getItem('show_v4r1');
    return show === 'true';
  }

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

  static async setExcludedJettons(excludedJettons: any) {
    await AsyncStorage.setItem('excludedJettons', JSON.stringify(excludedJettons));
  }

  static async getExcludedJettons() {
    try {
      const excludedJettons = await AsyncStorage.getItem('excludedJettons');
      if (!excludedJettons) {
        return {};
      }
      return await JSON.parse(excludedJettons);
    } catch (e) {
      return {};
    }
  }

  static async isNewSecurityFlow(): Promise<boolean> {
    return (await AsyncStorage.getItem('new_security_flow')) === 'yes';
  }

  static async enableNewSecurityFlow() {
    await AsyncStorage.setItem('new_security_flow', 'yes');
  }

  static async isBiometryEnabled(): Promise<boolean> {
    return (await AsyncStorage.getItem('biometry_enabled')) === 'yes';
  }

  static async setBiometryEnabled(isEnabled: boolean) {
    if (isEnabled) {
      await AsyncStorage.setItem('biometry_enabled', 'yes');
    } else {
      await AsyncStorage.removeItem('biometry_enabled');
    }
  }

  static async getKeychainService() {
    return await AsyncStorage.getItem('keychainService');
  }

  static async setKeychainService(keychainService: string) {
    await AsyncStorage.setItem('keychainService', keychainService);
  }

  static async setAccent(key: AccentKey) {
    await AsyncStorage.setItem('accent', key);
  }

  static async setDevConfig(config: string) {
    await AsyncStorage.setItem('dev_config', config);
  }

  static async removeDevConfig() {
    await AsyncStorage.removeItem('dev_config');
  }

  static async getDevConfig() {
    return await AsyncStorage.getItem('dev_config');
  }

  static async getAccent(): Promise<AccentKey> {
    const accent = await AsyncStorage.getItem('accent');
    return (accent as AccentKey) || AccentKey.default;
  }

  static async setTonCustomIcon(data: AccentNFTIcon | null) {
    await AsyncStorage.setItem('ton_custom_icon', JSON.stringify(data));
  }

  static async getTonCustomIcon(): Promise<AccentNFTIcon | null> {
    try {
      const data = await AsyncStorage.getItem('ton_custom_icon');
      if (!data) {
        return null;
      }
      return await JSON.parse(data);
    } catch (e) {
      return null;
    }
  }
}

export async function getPrimaryFiatCurrency(): Promise<FiatCurrency | null> {
  const res = await AsyncStorage.getItem(`${getWalletName()}_primary_currency`);
  if (res) {
    return res as FiatCurrency;
  } else {
    return null;
  }
}

export async function setPrimaryFiatCurrency(currency: FiatCurrency) {
  await AsyncStorage.setItem(`${getWalletName()}_primary_currency`, currency);
}

export async function clearPrimaryFiatCurrency() {
  await AsyncStorage.removeItem(`${getWalletName()}_primary_currency`);
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

export async function clearHiddenNotification() {
  await AsyncStorage.removeItem(`${getWalletName()}_hidden_internal_notifications`);
}

export async function getLastRefreshedAt() {
  const stored = (await AsyncStorage.getItem('last_refresh_at')) || 0;
  return +stored;
}

export async function setLastRefreshedAt(ts: number) {
  await AsyncStorage.setItem('last_refresh_at', `${ts}`);
}

export async function getSavedServerConfig(
  isTestnet: boolean,
): Promise<ServerConfig | null> {
  let key = `${getWalletName()}_server_config`;
  if (isTestnet) {
    key += '_testnet';
  }

  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export async function setSavedServerConfig(config: ServerConfig, isTestnet: boolean) {
  let key = `${getWalletName()}_server_config`;
  if (isTestnet) {
    key += '_testnet';
  }

  config._version = ServerConfigVersion;
  await AsyncStorage.setItem(key, JSON.stringify(config));
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
