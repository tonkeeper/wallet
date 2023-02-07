import AsyncStorage from '@react-native-async-storage/async-storage';

import { JettonBalanceModel } from '$store/models';
import { getWalletName } from '$shared/dynamicConfig';

export class JettonsDB {
  static async getJettonBalances() {
    const wallet = getWalletName();
    try {
      const raw = await AsyncStorage.getItem(`${wallet}_jettons`);
      if (!raw) {
        return [];
      }
      return JSON.parse(raw || '') as Promise<JettonBalanceModel[]>;
    } catch (e) {
      return [];
    }
  }

  static async saveJettons(jettons: JettonBalanceModel[]) {
    const wallet = getWalletName();
    await AsyncStorage.setItem(`${wallet}_jettons`, JSON.stringify(jettons));
  }
  
  static async clearAll() {
    const wallet = getWalletName();
    await AsyncStorage.removeItem(`${wallet}_jettons`);
  }
}
