import AsyncStorage from '@react-native-async-storage/async-storage';
import { Storage } from '@tonkeeper/core';

export class AppStorage implements Storage {
  public removeItem = AsyncStorage.removeItem;
  public setItem = AsyncStorage.setItem;
  public getItem = AsyncStorage.getItem;
  public set = AsyncStorage.setItem;
}
