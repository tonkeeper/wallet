import { CustomNftItem, NftImage } from '../TonAPI/CustomNftItems';
import { Address } from '../formatters/Address';
import { WalletContext } from '../Wallet';
import { NftItem } from '../TonAPI';

export class NftsManager {
  public persisted = undefined;
  constructor(private ctx: WalletContext) {}

  public get cacheKey() {
    return ['nfts', this.ctx.address.ton.raw];
  }

  public async preload() {}

  public getCachedByAddress(nftAddress: string, existingNftItem?: NftItem) {
    if (existingNftItem) {
      return this.makeCustomNftItem(existingNftItem);
    }

    const nftItem = this.ctx.queryClient.getQueryData<CustomNftItem>(['nft', nftAddress]);
    if (nftItem) {
      return nftItem;
    }

    return null;
  }

  public async fetchByAddress(nftAddress: string) {
    const nftItem = await this.ctx.tonapi.nfts.getNftItemByAddress(nftAddress);

    if (nftItem) {
      const customNftItem = this.makeCustomNftItem(nftItem);
      this.ctx.queryClient.setQueryData(['nft', nftItem.address], customNftItem);
      return customNftItem;
    }

    throw new Error('No nftItem');
  }

  public makeCustomNftItem(nftItem: NftItem) {
    const image = (nftItem.previews ?? []).reduce<NftImage>(
      (acc, image) => {
        if (image.resolution === '5x5') {
          acc.preview = image.url;
        }

        if (image.resolution === '100x100') {
          acc.small = image.url;
        }

        if (image.resolution === '500x500') {
          acc.medium = image.url;
        }

        if (image.resolution === '1500x1500') {
          acc.large = image.url;
        }

        return acc;
      },
      {
        preview: null,
        small: null,
        medium: null,
        large: null,
      },
    );

    const isDomain = !!nftItem.dns;
    const isUsername = isTelegramUsername(nftItem.dns);

    const customNftItem: CustomNftItem = {
      ...nftItem,
      name: nftItem.metadata.name,
      isUsername,
      isDomain,
      image,
    };

    if (customNftItem.metadata) {
      customNftItem.marketplaceURL = nftItem.metadata.external_url;
    }

    // Custom collection name
    if (isDomain && customNftItem.collection) {
      customNftItem.collection.name = 'TON DNS';
    }

    // Custom nft name
    if (isDomain) {
      customNftItem.name = modifyNftName(nftItem.dns)!;
    } else if (!customNftItem.name) {
      customNftItem.name = Address.toShort(nftItem.address);
    }

    return customNftItem;
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
  return name?.endsWith('.t.me') || false;
};

export const modifyNftName = (name?: string) => {
  if (isTelegramUsername(name)) {
    return domainToUsername(name);
  }

  return name;
};
