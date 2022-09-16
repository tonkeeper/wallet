import { FavoriteModel } from '$store/models';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveFavorites(favorites: FavoriteModel[]) {
  try {
    await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
  } catch {}
}

export async function getFavorites(): Promise<FavoriteModel[]> {
  const raw = await AsyncStorage.getItem('favorites');

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export async function saveHiddenRecentAddresses(addresses: string[]) {
  try {
    await AsyncStorage.setItem('hidden_addresses', JSON.stringify(addresses));
  } catch {}
}

export async function getHiddenRecentAddresses(): Promise<string[]> {
  const raw = await AsyncStorage.getItem('hidden_addresses');

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}
