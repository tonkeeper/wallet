import AsyncStorage from '@react-native-async-storage/async-storage';

import { NFTsDB } from '$database';
import { NFTsMap } from '$store/nfts/interface';

export class Cache {
  readonly walletName: string;

  constructor(walletName: string) {
    this.walletName = walletName;
  }

  static async clearAll(walletName: string) {
    await AsyncStorage.removeItem(`${walletName}_nfts`);
  }

  async get() {
    return await NFTsDB.getNFTs();
  }

  async save(nfts: NFTsMap) {
    await NFTsDB.saveNFTs(nfts);
  }
}
