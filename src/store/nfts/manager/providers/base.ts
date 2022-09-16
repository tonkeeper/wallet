import { CollectionModel, NFTModel } from '$store/models';

export interface BaseProviderInterface {
  loadNext(): Promise<NFTModel[]>;
  loadNFTItem(address: string): Promise<NFTModel>;
  loadCollections(collections: string[]): Promise<{ [key: string]: CollectionModel }>;
  canLoadMore(): boolean;
  name: string;
}

export abstract class BaseProvider implements BaseProviderInterface {
  abstract name: string;
  readonly address: string;
  nextFrom: string | null = null;
  canMore = true;

  constructor(address: string) {
    this.address = address;
  }

  loadNext(): Promise<NFTModel[]> {
    throw new Error('loadNext is not implemented');
  }

  loadNFTItem(address: string): Promise<NFTModel> {
    throw new Error('loadNFTItem is not implemented');
  }

  loadCollections(_: string[]): Promise<{ [key: string]: CollectionModel }> {
    throw new Error('loadCollections is not implemented');
  }

  canLoadMore() {
    return !!this.nextFrom && this.canMore;
  }
}
