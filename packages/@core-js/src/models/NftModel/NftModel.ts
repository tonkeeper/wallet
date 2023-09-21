import { NftImage, NftItem } from './NftModelTypes';
import { Address } from '../../formatters/Address';
import { RawNftItem } from '../../TonAPI';

export class NftModel {
  static createItem(rawNftItem: RawNftItem) {
    const image = (rawNftItem.previews ?? []).reduce<NftImage>(
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

    const isDomain = !!rawNftItem.dns;
    const isUsername = this.isTelegramUsername(rawNftItem.dns);

    const nftItem: NftItem = {
      ...rawNftItem,
      name: rawNftItem.metadata.name,
      isUsername,
      isDomain,
      image,
    };

    if (nftItem.metadata) {
      nftItem.marketplaceURL = nftItem.metadata.external_url;
    }

    if (isDomain && nftItem.collection) {
      nftItem.collection.name = 'TON DNS';
    }

    if (isDomain) {
      nftItem.name = this.modifyName(nftItem.dns);
    } else if (!nftItem.name) {
      nftItem.name = Address.parse(nftItem.address).toShort();
    }

    return nftItem;
  }

  static domainToUsername(name?: string) {
    return name ? '@' + name.replace('.t.me', '') : '';
  }

  static isTelegramUsername(name?: string) {
    return name?.endsWith('.t.me') || false;
  }

  static modifyName(name?: string) {
    if (this.isTelegramUsername(name)) {
      return this.domainToUsername(name);
    }

    return name ?? '';
  }
}
