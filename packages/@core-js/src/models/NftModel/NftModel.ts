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

  static isDiamond(nftItem: NftItem) {
    if (nftItem.collection) {
      const diamondsCollectionAdresses = {
        mainnet: '0:06d811f426598591b32b2c49f29f66c821368e4acb1de16762b04e0174532465',
        testnet: '0:d1d65a93c213c92a39046c80b05c16daae1c42297a8d3a54530cc31bc5ba9a99',
      };

      return Object.values(diamondsCollectionAdresses).includes(
        nftItem.collection?.address,
      );
    }

    return false;
  }
}
