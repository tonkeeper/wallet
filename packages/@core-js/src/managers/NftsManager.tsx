import { NftItem } from '../TonAPI';
import { WalletContext } from '../Wallet';

export class NftsManager {
  public persisted = undefined;
  constructor(private ctx: WalletContext) {}

  public get cacheKey() {
    return ['nfts', this.ctx.accountId];
  }

  public async preload() {}

  public getCachedByAddress(nftAddress: string, existingNftItem?: NftItem) {
    if (existingNftItem) {
      return existingNftItem;
    }

    const nftItem = this.ctx.queryClient.getQueryData<NftItem>(['nft', nftAddress]);
    console.log(JSON.stringify(nftItem));
    if (nftItem) {
      return nftItem; //this.mapNft(nftItem);
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

export const domainToUsername = (name?: string) => {
  return name ? '@' + name.replace('.t.me', '') : '';
};

export const isTelegramUsername = (name?: string) => {
  return name?.endsWith('.t.me');
};

export const modifyNftName = (name?: string) => {
  if (isTelegramUsername(name)) {
    return domainToUsername(name);
  }

  return name;
};
