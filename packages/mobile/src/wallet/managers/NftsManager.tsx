import { CustomNftItem, NftImage } from '@tonkeeper/core/src/TonAPI/CustomNftItems';
import { Address } from '@tonkeeper/core/src/formatters/Address';
import { NftItem, TonAPI } from '@tonkeeper/core/src/TonAPI';
import { Storage } from '@tonkeeper/core/src/declarations/Storage';
import { State } from '@tonkeeper/core/src/utils/State';
import { TonRawAddress } from '$wallet/WalletTypes';
import { config } from '$config';
import { JettonsManager } from './JettonsManager';

export type NftsState = {
  nfts: Record<NftItem['address'], NftItem>;
  selectedDiamond: NftItem | null;
  accountNfts: Record<NftItem['address'], NftItem>;
  isReloading: boolean;
  isLoading: boolean;
};

export class NftsManager {
  static readonly INITIAL_STATE: NftsState = {
    nfts: {},
    selectedDiamond: null,
    accountNfts: {},
    isReloading: false,
    isLoading: false,
  };

  public state = new State<NftsState>(NftsManager.INITIAL_STATE);

  constructor(
    private persistPath: string,
    private tonRawAddress: TonRawAddress,
    private tonapi: TonAPI,
    private storage: Storage,
    private jettons: JettonsManager,
  ) {
    this.state.persist({
      partialize: ({ accountNfts, selectedDiamond }) => ({
        accountNfts,
        selectedDiamond,
      }),
      storage: this.storage,
      key: `${this.persistPath}/nfts`,
    });
  }

  public setSelectedDiamond(nftAddress: string | null) {
    this.state.set(({ accountNfts }) => ({
      selectedDiamond: nftAddress ? accountNfts[Address.parse(nftAddress).toRaw()] : null,
    }));
  }

  public async load() {
    try {
      this.state.set({ isLoading: true });

      const response = await this.tonapi.accounts.getAccountNftItems({
        accountId: this.tonRawAddress,
        indirect_ownership: true,
      });

      const accountNfts = response.nft_items.reduce<Record<string, NftItem>>(
        (acc, item) => {
          if (item.metadata?.render_type !== 'hidden') {
            acc[item.address] = item;
          }
          return acc;
        },
        {},
      );

      if (
        response.nft_items.some(
          (item) =>
            item.collection &&
            Address.compare(
              item.collection.address,
              config.get('notcoin_nft_collection'),
            ),
        )
      ) {
        this.jettons.loadRate(config.get('notcoin_jetton_master'));
      }

      this.state.set({ accountNfts });

      if (this.state.data.selectedDiamond) {
        this.setSelectedDiamond(this.state.data.selectedDiamond.address);
      }
    } catch {
    } finally {
      this.state.set({ isLoading: false });
    }
  }

  public reset() {
    this.state.set(NftsManager.INITIAL_STATE);
  }

  public async rehydrate() {
    return this.state.rehydrate();
  }

  public async reload() {
    this.state.set({ isReloading: true });
    await this.load();
    this.state.set({ isReloading: false });
  }

  public updateNftOwner(nftAddress: string, ownerAddress: string) {
    this.state.set((state) => {
      if (state.nfts[nftAddress]?.owner) {
        state.nfts[nftAddress].owner!.address = ownerAddress;
      }

      return state;
    });
  }

  public getCachedByAddress(nftAddress: string, existingNftItem?: NftItem) {
    if (existingNftItem) {
      return this.makeCustomNftItem(existingNftItem);
    }

    const address = new Address(nftAddress);

    const nftItem =
      this.state.data.accountNfts[address.toRaw()] ??
      this.state.data.nfts[address.toRaw()];
    if (nftItem) {
      return this.makeCustomNftItem(nftItem);
    }

    return null;
  }

  public async fetchByAddress(nftAddress: string) {
    const nftItem = await this.tonapi.nfts.getNftItemByAddress(nftAddress);

    if (nftItem) {
      this.state.set({ nfts: { ...this.state.data.nfts, [nftItem.address]: nftItem } });

      const customNftItem = this.makeCustomNftItem(nftItem);

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
