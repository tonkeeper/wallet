import AsyncStorage from '@react-native-async-storage/async-storage';

import { EventModel } from '$store/models';
import { getWalletName } from '$shared/dynamicConfig';
import { AccountEvent } from 'tonapi-sdk-js';

export class EventsDB {
  static async getEvents() {
    const wallet = getWalletName();
    const raw = await AsyncStorage.getItem(`${wallet}_events`);

    try {
      return JSON.parse(raw || '') as EventModel[];
    } catch (e) {
      return [];
    }
  }

  static async saveEvents(events: AccountEvent[]) {
    const wallet = getWalletName();
    await AsyncStorage.setItem(`${wallet}_events`, JSON.stringify(events));
  }

  static async clearAll() {
    const wallet = getWalletName();
    await AsyncStorage.removeItem(`${wallet}_events`);
    await this.clearMempoolEvents();
  }

  static async addMempoolEvent(event: AccountEvent) {
    const events = await EventsDB.getMempoolEvents();
    events.push(event);
    await EventsDB.saveMempoolEvents(events);
    return events;
  }

  static async clearMempoolEvents() {
    const wallet = getWalletName();
    await AsyncStorage.removeItem(`${wallet}_mempool_events`);
  }

  static async saveMempoolEvents(events: AccountEvent[]) {
    const wallet = getWalletName();
    await AsyncStorage.setItem(`${wallet}_mempool_events`, JSON.stringify(events));
  }

  static async getMempoolEvents(): Promise<AccountEvent[]> {
    const wallet = getWalletName();

    const raw = await AsyncStorage.getItem(`${wallet}_mempool_events`);

    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }
}
