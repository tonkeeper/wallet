import { BaseProviderInterface } from '$store/nfts/manager/providers/base';
import { TonProvider } from '$store/nfts/manager/providers/ton';
import { NFTModel } from '$store/models';
import { NFTsDB } from '$database';
import { NFTsMap } from '$store/nfts/interface';

type TonAddresses = { v3R1?: string; v3R2?: string; v4R1?: string; v4R2?: string };

export interface NFTsManagerOptions {
  walletName: string;
  tonAddresses: TonAddresses;
}

export class NFTsManager {
  private providers: BaseProviderInterface[];
  private nfts: { [index: string]: NFTModel } = {};

  constructor(options: NFTsManagerOptions) {
    this.providers = [
      ...Object.entries(options.tonAddresses).map(
        ([key, value]) => new TonProvider(value),
      ),
    ];
  }

  async fetch(): Promise<{ [index: string]: NFTModel }> {
    // @ts-ignore
    let responses: any = await Promise.all([
      ...this.providers.map((provider) => provider.loadNext()),
    ]);

    for (let nfts of responses) {
      for (let nft of nfts) {
        this.nfts[nft.internalId] = nft;
      }
    }

    NFTsDB.saveNFTs(this.nfts).catch(() => {
      console.log("Can't save nfts to cache");
    });

    return this.nfts;
  }

  async fetchNFTItem(address: string): Promise<NFTModel> {
    // TODO: поддержка разных чейнов
    // @ts-ignore
    const nft = await this.providers[0].loadNFTItem(address);

    return nft;
  }

  async fromCache(): Promise<NFTsMap> {
    return await NFTsDB.getNFTs();
  }

  async canLoadMore(): Promise<boolean> {
    for (let provider of this.providers) {
      if (provider.canLoadMore()) {
        return true;
      }
    }

    return false;
  }
}
