import { NftAddress, NftItem, NftModel } from '../models/NftModel';
import { Storage } from '../declarations/Storage';
import { TonRawAddress } from '../WalletTypes';
import { State } from '../utils/State';
import { TonAPI } from '../TonAPI';
import { Logger } from '../utils/Logger';

type NftsState = {
  error: string | null;
  isLoading: boolean;
  hasMore: boolean;
  items: NftItem[];
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

  public async load(cursor?: number | null) {
    try {
      this.state.set({ isLoading: true, error: null });

      const limit = 50;
      const { nft_items } = await this.tonapi.accounts.getAccountNftItems({
        offset: cursor ?? undefined,
        accountId: this.address,
        limit,
      });

      const items = nft_items.map((item) => {
        const nftItem = NftModel.createItem(item);
        this.nfts.set(nftItem.address, nftItem);
        return nftItem;
      });

      const hasMore = limit === nft_items.length && !!cursor;
      this.state.set((state) => ({
        items: [...state.items, ...items],
        isLoading: false,
        error: null,
        hasMore,
      }));
    } catch (err) {
      const message = `[Nfts]: ${Logger.getErrorMessage(err)}`;
      console.log(message);
      this.state.set({
        error: err.message,
        isLoading: false,
      });
    }
  }

  public async loadMore() {
    const { isLoading, hasMore, error } = this.state.data;
    if (!isLoading && hasMore && error === null) {
      return this.load(this.cursor);
    }
  }

  public async reload() {
    return this.load();
  }

  public getLoadedItem(nftAddress: NftAddress) {
    if (this.nfts.has(nftAddress)) {
      return this.nfts.get(nftAddress)!;
    }

    return null;
  }

  public async loadItem(nftAddress: NftAddress) {
    const rawNftItem = await this.tonapi.nfts.getNftItemByAddress(nftAddress);
    if (rawNftItem) {
      const nftItem = NftModel.createItem(rawNftItem);
      this.nfts.set(nftAddress, nftItem);
      return nftItem;
    }

    return null;
  }

  // public loadBulk
}
