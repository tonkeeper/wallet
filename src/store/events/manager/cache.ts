import AsyncStorage from '@react-native-async-storage/async-storage';

import { EventModel } from '$store/models';
import { EventsDB } from '$database';

export interface NextFromPair {
  lt: number;
  nextFrom: string;
}

export class Cache {
  readonly walletName: string;

  constructor(walletName: string) {
    this.walletName = walletName;
  }

  static async clearAll(walletName: string) {
    await AsyncStorage.removeItem(`${walletName}_events`);
  }

  async get() {
    const raw = await AsyncStorage.getItem(`${this.walletName}_events`);
    try {
      return JSON.parse(raw || '') as EventModel[];
    } catch (e) {
      return [];
    }
  }

  async save(events: EventModel[]) {
    await AsyncStorage.setItem(`${this.walletName}_events`, JSON.stringify(events));
  }

  async getNextFromList(providerName: string): Promise<NextFromPair[]> {
    const raw = await AsyncStorage.getItem(
      `${this.walletName}_${providerName}_next_from_list`,
    );

    try {
      return JSON.parse(raw || '') as NextFromPair[];
    } catch (e) {
      return [];
    }
  }

  async saveNextFromList(providerName: string, list: NextFromPair[]) {
    await AsyncStorage.setItem(
      `${this.walletName}_${providerName}_next_from_list`,
      JSON.stringify(list),
    );
  }

  async getMempool() {
    return EventsDB.getMempoolEvents();
  }

  async saveMempool(events: EventModel[]) {
    await EventsDB.saveMempoolEvents(events);
  }
}
