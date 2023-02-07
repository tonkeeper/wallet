import { createSelector, createSlice } from '@reduxjs/toolkit';

import { RootState } from '$store/rootReducer';
import {
  DeleteFavoriteAction,
  FavoritesState,
  HideRecentAddressAction,
  SetFavoritesAction,
  SetHiddenRecentAddressesAction,
  UpdateDnsAddressesAction,
  UpdateFavoriteAction,
} from './interface';

const initialState: FavoritesState = {
  favorites: [],
  hiddenRecentAddresses: [],
  updatedDnsAddresses: {},
};

export const { actions, reducer } = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    loadSuggests() {},
    setFavorites(state, action: SetFavoritesAction) {
      state.favorites = action.payload;
    },
    updateDnsAddresses(state, action: UpdateDnsAddressesAction) {
      state.updatedDnsAddresses = { ...state.updatedDnsAddresses, ...action.payload };
    },
    updateFavorite(state, action: UpdateFavoriteAction) {
      const index = state.favorites.findIndex(
        (item) =>
          item.address === action.payload.address ||
          (item.domain && item.domain === action.payload.domain),
      );

      if (index !== -1) {
        state.favorites[index] = action.payload;
      } else {
        state.favorites.push(action.payload);
      }
    },
    deleteFavorite(state, action: DeleteFavoriteAction) {
      const index = state.favorites.findIndex(
        (item) =>
          item.address === action.payload.address ||
          (item.domain && item.domain === action.payload.domain),
      );

      if (index !== -1) {
        state.favorites.splice(index, 1);
      }
    },
    setHiddenRecentAddresses(state, action: SetHiddenRecentAddressesAction) {
      state.hiddenRecentAddresses = action.payload;
    },
    hideRecentAddress(state, action: HideRecentAddressAction) {
      state.hiddenRecentAddresses.push(action.payload);
    },
    restoreHiddenAddress(state, action: HideRecentAddressAction) {
      const index = state.hiddenRecentAddresses.findIndex(
        (item) => item === action.payload,
      );

      if (index !== -1) {
        state.hiddenRecentAddresses.splice(index, 1);
      }
    },
    reset() {
      return initialState;
    },
  },
});

export { reducer as favoritesReducer, actions as favoritesActions };

export const favoritesSelector = (state: RootState) => state.favorites;
export const favoritesFavoritesSelector = createSelector(
  favoritesSelector,
  (state) => state.favorites,
);
export const favoritesHiddenRecentAddressesSelector = createSelector(
  favoritesSelector,
  (state) => state.hiddenRecentAddresses,
);
