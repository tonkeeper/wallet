import { Address } from '../../formatters/Address';
import { NftImage } from './NftModelTypes';
import { NftItem } from '../../TonAPI';

export class NftModel {
  static createItem(nftItem: NftItem) {
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
    const isUsername = this.isTelegramUsername(nftItem.dns);

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

    if (isDomain && customNftItem.collection) {
      customNftItem.collection.name = 'TON DNS';
    }

    if (isDomain) {
      customNftItem.name = this.modifyName(nftItem.dns);
    } else if (!customNftItem.name) {
      customNftItem.name = Address.parse(nftItem.address).toShort();
    }

    return customNftItem;
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

    return name;
  }
}
