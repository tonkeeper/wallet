import AsyncStorage from '@react-native-async-storage/async-storage';

import { getWalletName } from '$shared/dynamicConfig';

export interface MigrationState {
  checkBalance: string;
  startAt: number;
  newAddress: string;
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

export async function saveOldBalancesToDB(
  balances: { balance: string; version: string }[],
) {
  const wallet = getWalletName();
  await AsyncStorage.setItem(`${wallet}_old_balances`, JSON.stringify(balances));
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
