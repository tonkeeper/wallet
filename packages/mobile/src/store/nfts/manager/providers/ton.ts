import TonWeb from 'tonweb';

import { BaseProvider } from '$store/nfts/manager/providers/base';
import { CryptoCurrencies, getServerConfig } from '$shared/constants';
import { CollectionModel, NFTModel } from '$store/models';
import _ from 'lodash';
import { Configuration, NFTApi } from 'tonapi-sdk-js';
import { allSettled } from 'bluebird';
import { proxyMedia } from '$utils/proxyMedia';
import { debugLog } from '$utils';

export class TonProvider extends BaseProvider {
  public readonly name = 'TonProvider';
  private nftApi = new NFTApi(
    new Configuration({
      basePath: getServerConfig('tonapiIOEndpoint'),
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
      },
    }),
  );

  async loadCollection(collectionAddress: string): Promise<CollectionModel> {
    const collection = await this.nftApi.getNftCollection({ account: collectionAddress });

    const name =
      typeof collection.metadata?.name === 'string'
        ? collection.metadata.name.trim()
        : collection.metadata?.name;

    return {
      // @ts-ignore
      getGemsModerated: collection.getGemsModerated, // TODO: ping Denis to implement
      addressRaw: collection.address,
      description: collection?.metadata?.description,
      address: new TonWeb.utils.Address(collection.address).toString(true, true, true),
      name,
    };
  }

  async loadCollections(
    collectionAddresses: string[],
  ): Promise<{ [key: string]: CollectionModel }> {
    const collectionsArr = await allSettled(
      collectionAddresses.map((collectionAddress) =>
        this.loadCollection(collectionAddress),
      ),
    );
    return collectionsArr.reduce((acc, current) => {
      if (current.isFulfilled()) {
        let collection = current.value();
        acc[collection.addressRaw] = collection;
      }
      return acc;
    }, {});
  }

  async fetchByOwnerAddress(): Promise<any[]> {
    try {
      if (!this.canMore) {
        return [];
      }

      const resp = await this.nftApi.searchNFTItems({
        includeOnSale: true,
        owner: this.address,
        limit: 1000,
        offset: 0,
      });

      const nfts = resp.nftItems;

      if (!nfts) {
        return [];
      }

      return nfts;
    } catch (e) {
      debugLog(e);
      return [];
    }
  }

  async loadNext(): Promise<NFTModel[]> {
    try {
      if (!this.canMore) {
        return [];
      }

      const ownedNfts = await this.fetchByOwnerAddress();
      let nfts: NFTModel[] = [];

      const collections = await this.loadCollections(
        _.uniq(
          ownedNfts
            .filter((nft) => nft.collection?.address)
            .map((nft) => nft.collection?.address),
        ),
      );

      if (ownedNfts?.length) {
        nfts = ownedNfts.map((nft) =>
          this.map(nft, collections[nft.collection?.address]),
        );
      }
      this.canMore = false;

      return nfts;
    } catch (e) {
      return [];
    }
  }

  async loadNFTItem(address: string): Promise<NFTModel> {
    const nfts = await this.nftApi.getNFTItems({ addresses: [address] });

    let nft = nfts.nftItems[0];
    if (!nft) throw new Error('NFT item not loaded');
    let collection: CollectionModel | undefined;
    if (nft.collection) {
      collection = await this.loadCollection(nft.collection.address);
    }
    return this.map(nft, collection);
  }

  private map = (nft: any, collection?: CollectionModel): NFTModel => {
    const address = new TonWeb.utils.Address(nft.address).toString(true, true, true);
    const ownerAddress =
      nft.owner?.address &&
      new TonWeb.utils.Address(nft.owner.address).toString(true, true, true);
    const name =
      typeof nft.metadata?.name === 'string'
        ? nft.metadata.name.trim()
        : nft.metadata?.name;

    const baseUrl =
      (nft.previews &&
        nft.previews.find((preview) => preview.resolution === '500x500').url) ||
      (nft.metadata?.image && proxyMedia(nft.metadata?.image, 512, 512));

    return {
      ...nft,
      ownerAddressToDisplay: nft.sale ? this.address : undefined,
      isApproved: !!nft.approvedBy?.length ?? false,
      internalId: `${CryptoCurrencies.Ton}_${address}`,
      currency: CryptoCurrencies.Ton,
      provider: this.name,
      content: {
        image: {
          baseUrl,
        },
      },
      description: nft.metadata?.description,
      marketplaceURL: nft.metadata?.marketplace && nft.metadata?.external_url,
      attributes: nft.metadata?.attributes,
      address,
      name,
      ownerAddress,
      collection,
    };
  };

  filterNFT(nft: NFTModel): boolean {
    return nft.currency === CryptoCurrencies.Ton;
  }
}
