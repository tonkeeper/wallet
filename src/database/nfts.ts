import AsyncStorage from '@react-native-async-storage/async-storage';

import { NFTModel } from '$store/models';
import { getWalletName } from '$shared/dynamicConfig';
import { NFTsMap } from '$store/nfts/interface';

export class NFTsDB {
  static async getNFTs() {
    const wallet = getWalletName();
    try {
      const raw = await AsyncStorage.getItem(`${wallet}_nfts`);
      if (!raw) {
        return {};
      }
      return JSON.parse(raw || '') as Promise<{ [index: string]: NFTModel }>;
    } catch (e) {
      return {};
    }
  }

  static async saveNFTs(nfts: NFTsMap) {
    const wallet = getWalletName();
    await AsyncStorage.setItem(`${wallet}_nfts`, JSON.stringify(nfts));
  }

  static async clearAll() {
    const wallet = getWalletName();
    await AsyncStorage.removeItem(`${wallet}_nfts`);
  }
}
