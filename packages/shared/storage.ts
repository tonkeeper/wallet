import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  setItem: AsyncStorage.setItem,
  getItem: AsyncStorage.getItem,
  set: AsyncStorage.setItem,
};
