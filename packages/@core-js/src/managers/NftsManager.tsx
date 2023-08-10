import { NftItem } from '../TonAPI';
import { WalletContext } from '../Wallet';

export class NftsManager {
  public persisted = undefined;
  constructor(private ctx: WalletContext) {}

  public get cacheKey() {
    return ['nfts', this.ctx.accountId];
  }

  public getCachedByAddress(nftAddress: string, existingNftItem?: NftItem) {
    if (existingNftItem) {
      return existingNftItem;
    }

    const nftItem = this.ctx.queryClient.getQueryData<NftItem>(['nft', nftAddress]);
    if (nftItem) {
      return nftItem; //this.mapNft(event, actionIndex);
    }

    return null;
  }

  public async fetchByAddress(nftAddress: string) {
    const { data: nftItem, error } = await this.ctx.tonapi.nfts.getNftItemByAddress(
      nftAddress,
    );

    if (error) {
      throw error;
    }

    if (nftItem) {
      this.ctx.queryClient.setQueryData(['nft', nftItem.address], nftItem);
      return nftItem;
    }

    throw new Error('No nftItem');
  }

  public fetch() {}

  public prefetch() {
    return this.ctx.queryClient.prefetchInfiniteQuery({
      queryFn: () => this.fetch(),
      queryKey: this.cacheKey,
    });
  }

  public async refetch() {
    await this.ctx.queryClient.refetchQueries({
      refetchPage: (_, index) => index === 0,
      queryKey: this.cacheKey,
    });
  }
}
