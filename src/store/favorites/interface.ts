import { FavoriteModel } from '$store/models';
import { PayloadAction } from '@reduxjs/toolkit';

export interface FavoritesState {
  favorites: FavoriteModel[];
  hiddenRecentAddresses: string[];
}

export type SetFavoritesAction = PayloadAction<FavoriteModel[]>;

export type UpdateFavoriteAction = PayloadAction<FavoriteModel>;

export type DeleteFavoriteAction = PayloadAction<FavoriteModel>;

export type SetHiddenRecentAddressesAction = PayloadAction<string[]>;

export type HideRecentAddressAction = PayloadAction<string>;

export type RestoreHiddenAddressAction = PayloadAction<string>;
