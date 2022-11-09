import {createSelector, createSlice} from '@reduxjs/toolkit';

import { RootState } from '$store/rootReducer';
import {
  SetNFTsAction,
  LoadNFTsAction,
  NFTsState,
  SetCanLoadMoreAction,
  NFTsMap,
  RemoveNFTsAction,
  SetLoadingAction,
  LoadNFTAction,
  SetNFTAction,
  SetIsEnabledAction,
  LoadMarketplacesAction,
  SetLoadedMarketplacesAction,
  RemoveFromBalancesAction,
} from './interface';

const initialState: NFTsState = {
  isLoading: false,
  myNfts: {},
  nfts: {},
  canLoadMore: false,
  isEnabled: false,
  marketplaces: [],
  isMarketplacesLoading: false,
};

export const { actions, reducer } = createSlice({
  name: 'nfts',
  initialState,
  reducers: {
    loadNFTs(state, action: LoadNFTsAction) {
      state.isLoading = true;
    },
    getIsFeatureEnabled(state) {},
    setIsEnabled(state, action: SetIsEnabledAction) {
      state.isEnabled = action.payload;
    },
    loadMarketplaces(state, action: LoadMarketplacesAction) {
      state.isMarketplacesLoading = true;
    },
    removeFromBalances(state, action: RemoveFromBalancesAction) {
      const copy = { ...state.myNfts };
      delete copy[action.payload.nftKey];
      state.myNfts = copy;
    },
    setLoadedMarketplaces(state, action: SetLoadedMarketplacesAction) {
      state.marketplaces = action.payload;
      state.isMarketplacesLoading = false;
    },
    loadNFT(state, action: LoadNFTAction) {},
    setIsLoading(state, action: SetLoadingAction) {
      state.isLoading = action.payload;
    },
    setCanLoadMore(state, action: SetCanLoadMoreAction) {
      state.canLoadMore = action.payload;
    },
    setNFTs(state, action: SetNFTsAction) {
      const infoMap: NFTsMap = action.payload.isReplace ? {} : { ...state.myNfts };
      for (let item of Object.values(action.payload.nfts)) {
        if (action.payload.mempoolNfts?.includes(item.address)) {
          continue;
        }
        infoMap[`${item.currency}_${item.address}`] = item;
      }
      state.myNfts = {
        ...infoMap,
      };

      if (!action.payload.isFromCache) {
        state.isLoading = false;
      }
    },
    setNFT(state, action: SetNFTAction) {
      const infoMap: NFTsMap = { ...state.nfts };
      const item = action.payload.nft;
      infoMap[`${item.currency}_${item.address}`] = item;

      state.nfts = {
        ...infoMap,
      };
    },
    removeNFTs(state, action: RemoveNFTsAction) {
      const copy = { ...state.myNfts };
      for (let id of action.payload) {
        delete copy[id];
      }
      state.myNfts = copy;
    },
    resetNFTs() {
      return initialState;
    },
  },
});

export { reducer as nftsReducer, actions as nftsActions };

export const nftsSelector = (state: RootState) => state.nfts;
export const myNftsSelector = createSelector(nftsSelector, nfts => nfts.myNfts);