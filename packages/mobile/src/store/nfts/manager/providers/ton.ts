import TonWeb from 'tonweb';

import { BaseProvider } from '$store/nfts/manager/providers/base';
import { CryptoCurrencies, getServerConfig } from '$shared/constants';
import { CollectionModel, NFTModel } from '$store/models';
import _ from 'lodash';
import { allSettled } from 'bluebird';
import { proxyMedia } from '$utils/proxyMedia';
import { debugLog } from '$utils';
import { Configuration, NFTApi, AccountsApi } from '@tonkeeper/core';

export class TonProvider extends BaseProvider {
  public readonly name = 'TonProvider';
  private nftApi = new NFTApi(
    new Configuration({
      basePath: getServerConfig('tonapiV2Endpoint'),
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiV2Key')}`,
      },
    }),
  );
  private accountsApi = new AccountsApi(
    new Configuration({
      basePath: getServerConfig('tonapiV2Endpoint'),
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiV2Key')}`,
      },
    }),
  );

  async loadCollection(collectionAddress: string): Promise<CollectionModel> {
    const collection = await this.nftApi.getNftCollection({
      accountId: collectionAddress,
    });

    const name =
      typeof collection.metadata?.name === 'string'
        ? collection.metadata.name.trim()
        : collection.metadata?.name;

    return {
      description: collection?.metadata?.description,
      address: collection.address,
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
        acc[collection.address] = collection;
      }
      return acc;
    }, {});
  }

  async fetchByOwnerAddress(): Promise<any[]> {
    try {
      if (!this.canMore) {
        return [];
      }

      const resp = await this.accountsApi.getNftItemsByOwner({
        accountId: this.address,
        limit: 1000,
        indirectOwnership: true,
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
    const nfts = await this.nftApi.getNftItemsByAddresses({
      getAccountsRequest: { accountIds: [address] },
    });

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
      collection: collection ?? nft.collection,
    };
  };

  filterNFT(nft: NFTModel): boolean {
    return nft.currency === CryptoCurrencies.Ton;
  }
}
