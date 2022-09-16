import { PayloadAction } from '@reduxjs/toolkit';

import { MarketplaceModel, NFTModel } from '$store/models';
import { CryptoCurrency } from '$shared/constants';

export type NFTsMap = { [index: string]: NFTModel };
export type NFTKeyPair = { currency: CryptoCurrency; address: string };

export interface NFTsState {
  isLoading: boolean;
  myNfts: NFTsMap;
  nfts: NFTsMap;
  canLoadMore: boolean;
  isEnabled: boolean;
  marketplaces: MarketplaceModel[];
  isMarketplacesLoading: boolean;
}

export type LoadNFTsAction = PayloadAction<{
  isLoadMore?: boolean;
  isReplace?: boolean;
}>;
export type SetIsEnabledAction = PayloadAction<boolean>;
export type SetLoadingAction = PayloadAction<boolean>;
export type LoadNFTAction = PayloadAction<{
  address: string;
}>;
export type SetNFTsAction = PayloadAction<{
  nfts: NFTsMap;
  isReplace: boolean;
  isFromCache?: boolean;
  mempoolNfts?: string[];
}>;
export type SetNFTAction = PayloadAction<{
  nft: NFTModel;
}>;
export type SetCanLoadMoreAction = PayloadAction<boolean>;
export type RemoveNFTsAction = PayloadAction<string[]>;
export type LoadMarketplacesAction = PayloadAction<undefined>;
export type SetLoadedMarketplacesAction = PayloadAction<MarketplaceModel[]>;
export type RemoveFromBalancesAction = PayloadAction<{ nftKey: string }>;
