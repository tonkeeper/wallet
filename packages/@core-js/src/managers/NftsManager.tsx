import { NftAddress, NftModel } from '../models/NftModel';
import { Storage } from '../declarations/Storage';
import { TonRawAddress } from '../WalletTypes';
import { NftItem, TonAPI } from '../TonAPI';
import { State } from '../utils/State';

type NftsState = {
  error: string | null;
  isLoading: boolean;
  hasMore: boolean;
  items: any[];
};

export class Nfts {
  private nfts = new Map<NftAddress, NftItem>();

  private cursor: number | null = null;
  public state = new State<NftsState>({
    isLoading: false,
    hasMore: true,
    error: null,
    items: [],
  });

  constructor(
    private address: TonRawAddress,
    private tonapi: TonAPI,
    private storage: Storage,
  ) {
    // this.state.persist({
    //   partialize: (state) => ({ items: state.items }),
    //   storage: this.storage,
    //   key: 'nfts',
    // });
  }

  public async load(cursor?: number) {
    try {
      this.state.set({ isLoading: true });

      const nftItems = await this.tonapi.accounts.getAccountNftItems({
        accountId: this.address,
        offset: cursor,
        limit: 50,
      });

      const items: any = nftItems.nft_items.map((item) => {
        return NftModel.createItem(item);
      });

      this.state.set((state) => ({
        items: [...state.items, ...items],
        hasMore: false,
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      this.state.set({
        error: err.message,
        isLoading: false,
      });
    }
  }

  public async reload() {}

  public async loadMore() {}

  public getLoadedItem(nftAddress: NftAddress) {
    if (this.nfts.has(nftAddress)) {
      return this.nfts.get(nftAddress)!;
    }

    return null;
  }

  public async loadItem(nftAddress: NftAddress) {
    const nftItem = await this.tonapi.nfts.getNftItemByAddress(nftAddress);
    if (nftItem) {
      const customNftItem = NftModel.createItem(nftItem);
      this.nfts.set(nftAddress, customNftItem);
      return customNftItem;
    }

    return null;
  }

  // public loadBulk
}
