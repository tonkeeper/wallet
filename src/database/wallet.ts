import AsyncStorage from '@react-native-async-storage/async-storage';

import { CryptoCurrencies, SelectableVersion } from '$shared/constants';
import { getWalletName } from '$shared/dynamicConfig';

export interface MigrationState {
  checkBalance: string;
  startAt: number;
  newAddress: string;
}

export async function getAddedCurrencies(): Promise<CryptoCurrencies[]> {
  const wallet = getWalletName();
  const raw = await AsyncStorage.getItem(`${wallet}_added_currencies`);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export async function saveAddedCurrencies(currencies: CryptoCurrencies[]) {
  const wallet = getWalletName();
  await AsyncStorage.setItem(`${wallet}_added_currencies`, JSON.stringify(currencies));
}

export async function getIntroShown(): Promise<boolean> {
  const result = await AsyncStorage.getItem('intro_shown');
  return !!result;
}

export async function setIntroShown(isShown: boolean) {
  if (isShown) {
    await AsyncStorage.setItem('intro_shown', '1');
  } else {
    await AsyncStorage.removeItem('intro_shown');
  }
}

export async function getIsTestnet(): Promise<boolean> {
  const result = await AsyncStorage.getItem('is_testnet');
  return !!result;
}

export async function setIsTestnet(isTestnet: boolean) {
  if (isTestnet) {
    await AsyncStorage.setItem('is_testnet', '1');
  } else {
    await AsyncStorage.removeItem('is_testnet');
  }
}

export async function getBalances(): Promise<{ [index: string]: string }> {
  const wallet = getWalletName();
  const raw = await AsyncStorage.getItem(`${wallet}_balances`);

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

export async function saveBalancesToDB(balances: { [index: string]: string }) {
  const wallet = getWalletName();
  await AsyncStorage.setItem(`${wallet}_balances`, JSON.stringify(balances));
}

export async function setMigrationState(state: MigrationState | null) {
  if (!state) {
    await AsyncStorage.removeItem('migration_state');
  } else {
    await AsyncStorage.setItem('migration_state', JSON.stringify(state));
  }
}

export async function getMigrationState(): Promise<MigrationState | null> {
  const raw = await AsyncStorage.getItem('migration_state');

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}
