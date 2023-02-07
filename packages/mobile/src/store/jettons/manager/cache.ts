import AsyncStorage from '@react-native-async-storage/async-storage';

import { JettonBalanceModel } from '$store/models';
import { JettonsDB } from '$database';

export class Cache {
  readonly walletName: string;

  constructor(walletName: string) {
    this.walletName = walletName;
  }

  static async clearAll(walletName: string) {
    await AsyncStorage.removeItem(`${walletName}_jettons`);
  }

  async get() {
    return await JettonsDB.getJettons();
  }

  async save(jettons: JettonBalanceModel[]) {
    await JettonsDB.saveJettons(jettons);
  }
}
